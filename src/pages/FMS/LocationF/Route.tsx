import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconUserPlus from '../../../components/Icon/IconUserPlus';
import IconListCheck from '../../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../../components/Icon/IconLayoutGrid';
import IconSearch from '../../../components/Icon/IconSearch';
import IconUser from '../../../components/Icon/IconUser';
import IconFacebook from '../../../components/Icon/IconFacebook';
import IconInstagram from '../../../components/Icon/IconInstagram';
import IconLinkedin from '../../../components/Icon/IconLinkedin';
import IconTwitter from '../../../components/Icon/IconTwitter';
import IconX from '../../../components/Icon/IconX';
import axios from 'axios';
import config from '../../../congif/config';
import City from './City';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MultiSelect } from '@mantine/core';

const Route = () => {
    const dispatch = useDispatch();
    const [defaultParams] = useState({
        route_name: '',
        originCountry: '',
        originState: '',
        originCity: '',
        destinationCountry: '',
        destinationState: '',
        destinationCity: '',
        totalFare: '',
        borderId: '',
        border: { Country_id: '1', borderName: 'US-Canada', type: 'Out', charges: 500 },
    });
    const [userData, setUserData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<any>(true);
    const [stateData, setstateData] = useState<any>([]);
    const [stateCity, setsstateCity] = useState<any>([]);
    const [filterState, setfilterState] = useState<any>([]);

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [viewContactModal, setViewContactModal] = useState<any>(false);
    useEffect(() => {
        dispatch(setPageTitle('Contacts'));
        const fetch = async () => {
            const { data } = await axios.get(`${config.API_BASE_URL}/routes`);

            const State = await axios.get(`${config.API_BASE_URL}/location/states`);
            setstateData(State.data);

            console.log(data.routes);
            const city = await axios.get(`${config.API_BASE_URL}/location/citys`);
            setsstateCity(city.data);
            setUserData(data.routes);
        };
        fetch();
    }, [addContactModal]);
    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const [value, setValue] = useState<any>('list');

    const changeValue = (e: any) => {
        const { value, id, name } = e.target;
        setParams({ ...params, [name]: value });
    };

    const [search, setSearch] = useState<any>('');
    // static for now
    let [contactList] = useState<any>(userData);

    const [filteredItems, setFilteredItems] = useState<any>(userData);
    console.log(filteredItems, 'filteredItems', userData);

    useEffect(() => {
        setFilteredItems(() => {
            return userData.filter((item: any) => {
                return item.route_name.toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [search, contactList, userData]);
    contactList = userData;

    const saveUser = async () => {
        if (Object.values(params).some((x) => x === null || x === '')) {
            showMessage('somthing  is missing', 'error');
            return true;
        }

        console.log(params, 'paraams >>>>>>>>>>>>>>>>>');
        if (params.client_id) {
            //update user

            delete params.id;
            let user: any = filteredItems.find((d: any) => d.client_id === params.client_id);
            // const update = await axios.put(`http://localhost:3004/api/users:${params.id}`,params)
            // console.log(update);
            const update = await axios.put(`${config.API_BASE_URL}/client/${params.client_id}`, params);
            console.log(update, 'lets checck');
        } else {
            //add user
            let maxUserId = filteredItems.length ? filteredItems.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredItems[0].id) : 0;

            let user = {
                id: maxUserId + 1,
                path: 'profile-35.png',
                name: params.name,
                email: params.email,
                phone: params.phone,
                role: params.role,
                location: params.location,
                posts: 20,
                followers: '5K',
                following: 500,
            };
            filteredItems.splice(0, 0, user);
            //   searchContacts()
            delete params.id;
            delete params.location;
            // params.params.id = 10000
            params.username = params.phone_number;
            let data = await axios.post(`${config.API_BASE_URL}/routes`, params);
            data.status === 201 ? showMessage('border_Routes created successfully') : '';
            setAddContactModal(false);
        }
        setAddContactModal(false);
    };

    const editUser = async (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
            // console.log(update);
        }
        // const update = await axios.put(`http://localhost:3004/api/client/${params.id}`,params)
        // console.log(update , "update >>>>>>>>>>>>>>>>>>>");
        setViewContactModal(false);
        setAddContactModal(true);
    };

    const deleteUser = async (user: any = null) => {
        // setFilteredItems(filteredItems.filter((d: any) => d.id !== user.id));
        await axios.delete(`${config.API_BASE_URL}/client/${user.client_id}`);
        showMessage('client has been deleted successfully.');
    };

    const ViewUser = async (user: any = null) => {
        // await axios.get(`http://localhost:3004/api/client/${user.client_id}`);
        setViewContactModal(true);
        setAddContactModal(true);
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };
    const options5 = [
        { value: 'orange', label: 'Orange' },
        { value: 'white', label: 'White' },
        { value: 'purple', label: 'Purple' },
    ];
    const validationSchema = Yup.object().shape({
        route_name: Yup.string().required('Route Name is required'),
        originCountry: Yup.string().required('Origin Country is required'),
        originState: Yup.string().required('Origin State is required'),
        originCity: Yup.string().required('Origin City is required'),
        destinationCountry: Yup.string().required('Destination Country is required'),
        destinationState: Yup.string().required('Destination State is required'),
        destinationCity: Yup.string().required('Destination City is required'),
        totalFare: Yup.string().required('Total Fare is required'),
        borderId: Yup.string().required('Border is required'),
    });
    const initialValues = {
        route_name: '',
        originCountry: '',
        originState: '',
        originCity: '',
        destinationCountry: '',
        destinationState: '',
        destinationCity: '',
        totalFare: '',
        borderId: '',
        border: { Country_id: '1', borderName: 'US-Canada', type: 'Out', charges: 500 },
    };
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            // Handle form submission logic here
            console.log(values);
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Route</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Route
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} onClick={() => setValue('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} onClick={() => setValue('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search Contacts" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Route Name</th>
                                    <th>Origin Country</th>
                                    <th>Destination Country</th>
                                    <th>Origin State</th>
                                    <th>Destination State</th>
                                    <th>Origin City</th>
                                    <th>Destination City</th>
                                    <th>Total Fare</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: any) => {
                                    return (
                                        <tr key={contact.id}>
                                            {/* <td>
                                                <div className="flex items-center w-max">
                                                    {contact.path && (
                                                        <div className="w-max">
                                                            <img src={`/assets/images/${contact.path}`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                        </div>
                                                    )}
                                                    {!contact.path && contact.company_name && (
                                                        <div className="grid place-content-center h-8 w-8 ltr:mr-2 rtl:ml-2 rounded-full bg-primary text-white text-sm font-semibold"></div>
                                                    )}
                                                    {!contact.path && !contact.company_name && (
                                                        <div className="border border-gray-300 dark:border-gray-800 rounded-full p-2 ltr:mr-2 rtl:ml-2">
                                                            <IconUser className="w-4.5 h-4.5" />
                                                        </div>
                                                    )}
                                                    <div>{contact.name}</div>
                                                </div>
                                            </td> */}
                                            <td className="whitespace-nowrap">{contact.route_id}</td>
                                            <td className="whitespace-nowrap">{contact.route_name}</td>
                                            <td className="whitespace-nowrap">{contact?.destination_Country?.country_name}</td>
                                            <td className="whitespace-nowrap">{contact?.origin_Country?.country_name}</td>
                                            <td className="whitespace-nowrap">{contact?.destination_State?.state_name}</td>
                                            <td className="whitespace-nowrap">{contact?.origin_State?.state_name}</td>
                                            <td className="whitespace-nowrap">{contact?.origin_City?.city_name}</td>
                                            <td className="whitespace-nowrap">{contact?.destination_City?.city_name}</td>
                                            <td className="whitespace-nowrap">{contact?.totalFare}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => ViewUser(contact)}>
                                                        view
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(contact)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {value === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredItems.map((contact: any) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={contact.id}>
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                    <div
                                        className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0 bg-"
                                        style={{
                                            backgroundImage: `url('/assets/images/notification-bg.png')`,
                                            backgroundRepeat: 'no-repeat',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        <img className="object-contain w-4/5 max-h-40 mx-auto" src={`/assets/images/${contact.path}`} alt="contact_image" />
                                    </div>
                                    <div className="px-6 pb-24 -mt-10 relative">
                                        <div className="shadow-md bg-white dark:bg-gray-900 rounded-md px-2 py-4">
                                            <div className="text-xl">{contact.name}</div>
                                            <div className="text-white-dark">{contact.role}</div>
                                            <div className="flex items-center justify-between flex-wrap mt-6 gap-3">
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.posts}</div>
                                                    <div>Posts</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.following}</div>
                                                    <div>Following</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.followers}</div>
                                                    <div>Followers</div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <ul className="flex space-x-4 rtl:space-x-reverse items-center justify-center">
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconFacebook />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconInstagram />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconLinkedin />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconTwitter />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                                                <div className="truncate text-white-dark">{contact.email}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                                                <div className="text-white-dark">{contact.phone}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Address :</div>
                                                <div className="text-white-dark">{contact.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-4 absolute bottom-0 w-full ltr:left-0 rtl:right-0 p-6">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(contact)}>
                                            Edit
                                        </button>
                                        <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => deleteUser(contact)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddContactModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params.client ? 'Edit Tracking' : 'Add Route'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div>
                                                <label htmlFor="routename">Route Name</label>
                                                <input
                                                    id="routename"
                                                    onChange={(e) => changeValue(e)}
                                                    value={params.route_name}
                                                    type="text"
                                                    name="route_name"
                                                    placeholder="Enter Route Name"
                                                    className="form-input"
                                                    required
                                                />
                                                {formik.touched.route_name && formik.errors.route_name && <div className="text-red-500 text-sm">{formik.errors.route_name}</div>}
                                            </div>
                                            <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <label htmlFor="ctnSelect1">Select Origin Country</label>
                                                        <select
                                                            onChange={(e) => changeValue(e)}
                                                            name="originCountry"
                                                            value={params.originCountry}
                                                            id="originCountry"
                                                            className="form-select text-white-dark"
                                                            required
                                                        >
                                                            <option>Select Origin Country</option>
                                                            {stateData.map((country: any) => (
                                                                <option key={country.country_id} value={(params.country_id = country.country_id)}>
                                                                    {country.country.country_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {formik.touched.originCountry && formik.errors.originCountry && <div className="text-red-500 text-sm">{formik.errors.originCountry}</div>}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="ctnSelect2">Select Origin State</label>
                                                        <select id="ctnSelect2" onChange={(e) => changeValue(e)} name="originState" className="form-select text-white-dark" required>
                                                            {stateData.map((country: any) => (
                                                                <option key={country.state_id} value={(params.originState = country.state_id)}>
                                                                    {country.state_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {formik.touched.originState && formik.errors.originState && <div className="text-red-500 text-sm">{formik.errors.originState}</div>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="ctnSelect3">Select Origin City</label>
                                                        <select id="ctnSelect3" onChange={(e) => changeValue(e)} name="originCity" className="form-select text-white-dark" required>
                                                            {stateCity.map((country: any) => (
                                                                <option key={country.city_id} value={(params.originCity = country.city_id)}>
                                                                    {country.city_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {formik.touched.originCity && formik.errors.originCity && <div className="text-red-500 text-sm">{formik.errors.originCity}</div>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <label htmlFor="ctnSelect4">Select Destination Country</label>
                                                        <select
                                                            id="ctnSelect4"
                                                            onChange={(e) => changeValue(e)}
                                                            value={params.destinationCountry}
                                                            name="destinationCountry"
                                                            className="form-select text-white-dark"
                                                            required
                                                        >
                                                            {stateData.map((country: any) => (
                                                                <option key={country.country_id} value={(params.destinationCountry = country.country_id)}>
                                                                    {country.country.country_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {formik.touched.destinationCountry && formik.errors.destinationCountry && (
                                                            <div className="text-red-500 text-sm">{formik.errors.destinationCountry}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="ctnSelect5">Select Destination State</label>
                                                        <select id="ctnSelect5" onChange={(e) => changeValue(e)} name="destinationState" className="form-select text-white-dark" required>
                                                            {stateData.map((country: any) => (
                                                                <option key={country.state_id} value={(params.destinationState = country.state_id)}>
                                                                    {country.state_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {formik.touched.destinationState && formik.errors.destinationState && (
                                                            <div className="text-red-500 text-sm">{formik.errors.destinationState}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="ctnSelect6">Select Destination City</label>

                                                        <select
                                                            id="ctnSelect6"
                                                            onChange={(e) => changeValue(e)}
                                                            value={params.destinationCity}
                                                            name="destinationCity"
                                                            className="form-select text-white-dark"
                                                            required
                                                        >
                                                            {stateCity.map((country: any) => (
                                                                <option key={country.city_id} value={(params.destinationCity = country.city_id)}>
                                                                    {country.city_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {formik.touched.destinationCity && formik.errors.destinationCity && <div className="text-red-500 text-sm">{formik.errors.destinationCity}</div>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label htmlFor="routenamee">Total Fare</label>
                                                <input
                                                    id="routenamee"
                                                    onChange={(e) => changeValue(e)}
                                                    value={params.totalFare}
                                                    type="number"
                                                    name="totalFare"
                                                    placeholder="Enter Total Fare"
                                                    className="form-input"
                                                    required
                                                />
                                                {formik.touched.totalFare && formik.errors.totalFare && <div className="text-red-500 text-sm">{formik.errors.totalFare}</div>}
                                            </div>
                                          

                                            {/* 
                                            <div className="mt-4">
                                                <label htmlFor="ctnSelect3">Select Border</label>
                                                <select id="ctnSelect3" onChange={(e) => changeValue(e)} value={params.Borders} name="Borders" className="form-select text-white-dark" required>
                                                    <option>Select Borders</option>
                                                    {options5.map((e) => {
                                                        return <option value={e.value}>{e.label}</option>;
                                                    })}
                                                </select>
                                            </div> */}
                                            <MultiSelect className='mt-4 text-b' label="Select Border"  placeholder="Select Border" data={['b1', 'b2', 'b3', 'b4']} />

                                            <div className="mt-4">
                                                <label htmlFor="routenamee">Total Fare</label>
                                                <select
                                                    id="type"
                                                    onChange={(e) => changeValue(e)}
                                                    value={params.totalFare}
                                                   
                                                    name="totalFare"
                                                  
                                                    className="form-select"
                                                    required
                                                >
                                                    <option value=''>Select Type</option>
                                                    <option>In</option>
                                                    <option>Out</option>
                                                </select>
                                                </div>

                                            {!viewContactModal && (
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" >
                                                        {params.driver_id ? 'Update' : 'Submit'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                    {params.client_id ? 'Update' : 'Add'}
                                                </button>
                                            </div> */}
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Route;
