//
// "use client"
//
// import { useState, useEffect } from "react"
// import { patientsAPI, usersAPI } from "../../services/api"
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   Heart,
//   X,
//   UserPlus,
//   AlertCircle,
//   MapPin,
//   FileText,
//   Plus,
//   Minus,
//   Ruler,
//   Weight,
// } from "lucide-react"
//
// const AddEditPatientModal = ({ isOpen, onClose, patient = null, onSuccess }) => {
//   const isEdit = !!patient
//
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     age: "",
//     gender: "",
//     bloodType: "",
//     height: "",
//     weight: "",
//     status: "Active",
//     avatar: "",
//     medicalHistory: [""],
//     allergies: [""],
//     emergencyContact: {
//       name: "",
//       relation: "",
//       phone: "",
//     },
//     nextAppointment: "",
//     address: "",
//     dateOfBirth: "",
//   })
//
//   const [errors, setErrors] = useState({})
//   const [submitting, setSubmitting] = useState(false)
//
//   const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
//   const genderOptions = ["Male", "Female", "Other"]
//   const statusOptions = ["Active", "Inactive", "Critical"]
//   const relationOptions = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]
//
//   useEffect(() => {
//     if (isOpen && isEdit && patient) {
//       // Map patient data from backend structure to form structure
//       const patientName =
//           patient.User?.first_name && patient.User?.last_name
//               ? `${patient.User.first_name} ${patient.User.last_name}`
//               : patient.name || ""
//
//       setFormData({
//         name: patientName,
//         email: patient.User?.email || patient.email || "",
//         phone: patient.User?.phone || patient.phone || "",
//         age: patient.age || "",
//         gender: patient.gender || "",
//         bloodType: patient.blood_type || patient.bloodType || "",
//         height: patient.height || "",
//         weight: patient.weight || "",
//         status: patient.status || "Active",
//         avatar: patient.avatar || "",
//         medicalHistory: patient.medical_history
//             ? Array.isArray(patient.medical_history)
//                 ? patient.medical_history
//                 : [patient.medical_history]
//             : patient.medicalHistory || [""],
//         allergies: patient.allergies
//             ? Array.isArray(patient.allergies)
//                 ? patient.allergies
//                 : [patient.allergies]
//             : [""],
//         emergencyContact: {
//           name: patient.emergency_contact?.name || patient.emergencyContact?.name || "",
//           relation: patient.emergency_contact?.relation || patient.emergencyContact?.relation || "",
//           phone: patient.emergency_contact?.phone || patient.emergencyContact?.phone || "",
//         },
//         nextAppointment: patient.nextAppointment || "",
//         address: patient.address || "",
//         dateOfBirth: patient.date_of_birth || patient.dateOfBirth || "",
//       })
//     } else if (isOpen && !isEdit) {
//       setFormData({
//         name: "",
//         email: "",
//         phone: "",
//         age: "",
//         gender: "",
//         bloodType: "",
//         height: "",
//         weight: "",
//         status: "Active",
//         avatar: "",
//         medicalHistory: [""],
//         allergies: [""],
//         emergencyContact: {
//           name: "",
//           relation: "",
//           phone: "",
//         },
//         nextAppointment: "",
//         address: "",
//         dateOfBirth: "",
//       })
//     }
//     setErrors({})
//   }, [isOpen, isEdit, patient])
//
//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     if (name.includes(".")) {
//       const [parent, child] = name.split(".")
//       setFormData((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value,
//         },
//       }))
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }))
//     }
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }))
//     }
//   }
//
//   const handleArrayChange = (field, index, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: prev[field].map((item, i) => (i === index ? value : item)),
//     }))
//   }
//
//   const addArrayField = (field) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: [...prev[field], ""],
//     }))
//   }
//
//   const removeArrayField = (field, index) => {
//     if (formData[field].length > 1) {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: prev[field].filter((_, i) => i !== index),
//       }))
//     }
//   }
//
//   const validateForm = () => {
//     const newErrors = {}
//
//     if (!formData.name.trim()) newErrors.name = "Name is required"
//     if (!formData.email.trim()) newErrors.email = "Email is required"
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
//     if (!formData.phone.trim()) newErrors.phone = "Phone is required"
//     if (!formData.age || formData.age < 1 || formData.age > 150) newErrors.age = "Valid age is required"
//     if (!formData.gender) newErrors.gender = "Gender is required"
//     if (!formData.bloodType) newErrors.bloodType = "Blood type is required"
//     if (formData.height && (isNaN(formData.height) || formData.height <= 0))
//       newErrors.height = "Height must be a valid number"
//     if (formData.weight && (isNaN(formData.weight) || formData.weight <= 0))
//       newErrors.weight = "Weight must be a valid number"
//     if (!formData.emergencyContact.name.trim())
//       newErrors["emergencyContact.name"] = "Emergency contact name is required"
//     if (!formData.emergencyContact.phone.trim())
//       newErrors["emergencyContact.phone"] = "Emergency contact phone is required"
//     if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required"
//
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }
//
//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return
//
//     setSubmitting(true)
//     try {
//       // Split name into first_name and last_name
//       const nameParts = formData.name.trim().split(" ")
//       const first_name = nameParts[0] || ""
//       const last_name = nameParts.slice(1).join(" ") || ""
//
//       let user_id = null
//
//       if (!isEdit) {
//         // Step 1: Create User record first (like in seedUsers.js)
//         const userData = {
//           email: formData.email,
//           password: "password123", // Using same default as seedUsers.js
//           first_name,
//           last_name,
//           phone: formData.phone,
//           date_of_birth: formData.dateOfBirth || null,
//           gender: formData.gender,
//           status: "Active",
//           role: 8, // Include role in the initial request
//         }
//
//         console.log("Creating user with data:", userData)
//         const userResponse = await usersAPI.create(userData)
//         console.log("User created:", userResponse.data)
//         user_id = userResponse.data.data.user.id
//       } else if (patient.User) {
//         // For editing, update the existing user
//         user_id = patient.User.id
//         const userData = {
//           first_name,
//           last_name,
//           email: formData.email,
//           phone: formData.phone,
//           date_of_birth: formData.dateOfBirth || null,
//           gender: formData.gender,
//         }
//         await usersAPI.update(user_id, userData)
//       }
//
//       // Step 3: Create/Update Patient record with user_id (like in seedUsers.js)
//       const patientData = {
//         user_id: user_id,
//         blood_type: formData.bloodType,
//         height: formData.height ? parseFloat(formData.height) : null,
//         weight: formData.weight ? parseFloat(formData.weight) : null,
//         medical_history: formData.medicalHistory.filter((item) => item.trim() !== ""),
//         allergies: formData.allergies.filter((item) => item.trim() !== ""),
//         current_medications: null,
//         insurance_provider: null,
//         insurance_policy_number: null,
//         emergency_contact_name: formData.emergencyContact.name,
//         emergency_contact_relation: formData.emergencyContact.relation,
//         emergency_contact_phone: formData.emergencyContact.phone,
//         address: formData.address,
//         city: null,
//         state: null,
//         postal_code: null,
//         country: null,
//         status: formData.status,
//       }
//
//       console.log("Creating/updating patient with data:", patientData)
//
//       let response
//       if (isEdit) {
//         response = await patientsAPI.update(patient.id, patientData)
//       } else {
//         response = await patientsAPI.create(patientData)
//       }
//
//       console.log(`Patient ${isEdit ? "updated" : "created"} successfully:`, response.data)
//
//       onSuccess()
//       onClose()
//       resetForm()
//     } catch (error) {
//       console.error(`Error ${isEdit ? "updating" : "creating"} patient:`, error)
//
//       let errorMessage = `Failed to ${isEdit ? "update" : "create"} patient. Please try again.`
//
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message
//       } else if (error.response?.data?.errors) {
//         const validationErrors = {}
//         error.response.data.errors.forEach((err) => {
//           validationErrors[err.path || err.param] = err.msg
//         })
//         setErrors(validationErrors)
//         return
//       } else if (error.message) {
//         errorMessage = error.message
//       }
//
//       setErrors({ general: errorMessage })
//     } finally {
//       setSubmitting(false)
//     }
//   }
//
//   const resetForm = () => {
//     setFormData({
//       name: "",
//       email: "",
//       phone: "",
//       age: "",
//       gender: "",
//       bloodType: "",
//       height: "",
//       weight: "",
//       status: "Active",
//       avatar: "",
//       medicalHistory: [""],
//       allergies: [""],
//       emergencyContact: {
//         name: "",
//         relation: "",
//         phone: "",
//       },
//       nextAppointment: "",
//       address: "",
//       dateOfBirth: "",
//     })
//     setErrors({})
//   }
//
//   if (!isOpen) return null
//
//   return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//           {/* Header */}
//           <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
//                   <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                     {isEdit ? "Edit Patient" : "Add New Patient"}
//                   </h2>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     {isEdit ? "Update patient information" : "Enter patient information and medical details"}
//                   </p>
//                 </div>
//               </div>
//               <button
//                   onClick={onClose}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//               >
//                 <X className="w-6 h-6 text-gray-500" />
//               </button>
//             </div>
//           </div>
//
//           <form onSubmit={handleSubmit} className="p-6 space-y-8">
//             {/* Error Message */}
//             {errors.general && (
//                 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
//                   <div className="flex items-center space-x-2">
//                     <AlertCircle className="w-5 h-5 text-red-500" />
//                     <span className="text-red-700 dark:text-red-300">{errors.general}</span>
//                   </div>
//                 </div>
//             )}
//
//             {/* Personal Information */}
//             <div className="space-y-6">
//               <div className="flex items-center space-x-2 mb-4">
//                 <User className="w-5 h-5 text-blue-600" />
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
//               </div>
//
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
//                   <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                           errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                       }`}
//                       placeholder="Enter full name"
//                   />
//                   {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Email Address *
//                   </label>
//                   <div className="relative">
//                     <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                             errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter email address"
//                     />
//                   </div>
//                   {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Phone Number *
//                   </label>
//                   <div className="relative">
//                     <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="tel"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleInputChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                             errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter phone number"
//                     />
//                   </div>
//                   {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age *</label>
//                   <input
//                       type="number"
//                       name="age"
//                       value={formData.age}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                           errors.age ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                       }`}
//                       placeholder="Enter age"
//                       min="1"
//                       max="150"
//                   />
//                   {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
//                   <select
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                           errors.gender ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                       }`}
//                   >
//                     <option value="">Select gender</option>
//                     {genderOptions.map((option) => (
//                         <option key={option} value={option}>
//                           {option}
//                         </option>
//                     ))}
//                   </select>
//                   {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Type *</label>
//                   <div className="relative">
//                     <Heart className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <select
//                         name="bloodType"
//                         value={formData.bloodType}
//                         onChange={handleInputChange}
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     >
//                       <option value="">Select blood type</option>
//                       {bloodTypes.map((type) => (
//                           <option key={type} value={type}>
//                             {type}
//                           </option>
//                       ))}
//                     </select>
//                   </div>
//                   {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (cm)</label>
//                   <div className="relative">
//                     <Ruler className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="number"
//                         name="height"
//                         value={formData.height}
//                         onChange={handleInputChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                             errors.height ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter height in cm"
//                         min="0"
//                         step="0.1"
//                     />
//                   </div>
//                   {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
//                   <div className="relative">
//                     <Weight className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="number"
//                         name="weight"
//                         value={formData.weight}
//                         onChange={handleInputChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                             errors.weight ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter weight in kg"
//                         min="0"
//                         step="0.1"
//                     />
//                   </div>
//                   {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
//                   <div className="relative">
//                     <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="date"
//                         name="dateOfBirth"
//                         value={formData.dateOfBirth}
//                         onChange={handleInputChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                             errors.dateOfBirth ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                     />
//                   </div>
//                   {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
//                   <select
//                       name="status"
//                       value={formData.status}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     {statusOptions.map((status) => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
//                 <div className="relative">
//                   <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
//                   <textarea
//                       name="address"
//                       value={formData.address}
//                       onChange={handleInputChange}
//                       rows="3"
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                       placeholder="Enter full address"
//                   />
//                 </div>
//               </div>
//             </div>
//
//             {/* Medical Information */}
//             <div className="space-y-6">
//               <div className="flex items-center space-x-2 mb-4">
//                 <FileText className="w-5 h-5 text-blue-600" />
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>
//               </div>
//
//               <div className="grid grid-cols-1 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Emergency Contact *
//                   </label>
//                   <input
//                       type="text"
//                       name="emergencyContact.name"
//                       value={formData.emergencyContact.name}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                           errors["emergencyContact.name"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                       }`}
//                       placeholder="Enter emergency contact name"
//                   />
//                   {errors["emergencyContact.name"] && (
//                       <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.name"]}</p>
//                   )}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relation</label>
//                   <select
//                       name="emergencyContact.relation"
//                       value={formData.emergencyContact.relation}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   >
//                     <option value="">Select relation</option>
//                     {relationOptions.map((relation) => (
//                         <option key={relation} value={relation}>
//                           {relation}
//                         </option>
//                     ))}
//                   </select>
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Phone Number *
//                   </label>
//                   <div className="relative">
//                     <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="tel"
//                         name="emergencyContact.phone"
//                         value={formData.emergencyContact.phone}
//                         onChange={handleInputChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                             errors["emergeryContact.phone"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter emergency contact phone"
//                     />
//                   </div>
//                   {errors["emergencyContact.phone"] && (
//                       <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.phone"]}</p>
//                   )}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Medical History
//                   </label>
//                   {formData.medicalHistory.map((item, index) => (
//                       <div key={index} className="flex items-center space-x-2 mb-2">
//                         <input
//                             type="text"
//                             value={item}
//                             onChange={(e) => handleArrayChange("medicalHistory", index, e.target.value)}
//                             className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                             placeholder="Enter medical history detail"
//                         />
//                         <button
//                             type="button"
//                             onClick={() => removeArrayField("medicalHistory", index)}
//                             className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
//                         >
//                           <Minus className="w-5 h-5 text-red-600" />
//                         </button>
//                       </div>
//                   ))}
//                   <button
//                       type="button"
//                       onClick={() => addArrayField("medicalHistory")}
//                       className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
//                   >
//                     <Plus className="w-5 h-5" />
//                     <span className="text-sm">Add Medical History Detail</span>
//                   </button>
//                   {errors.medicalHistory && <p className="text-red-500 text-sm mt-1">{errors.medicalHistory}</p>}
//                 </div>
//
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</label>
//                   {formData.allergies.map((item, index) => (
//                       <div key={index} className="flex items-center space-x-2 mb-2">
//                         <input
//                             type="text"
//                             value={item}
//                             onChange={(e) => handleArrayChange("allergies", index, e.target.value)}
//                             className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                             placeholder="Enter allergy detail"
//                         />
//                         <button
//                             type="button"
//                             onClick={() => removeArrayField("allergies", index)}
//                             className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
//                         >
//                           <Minus className="w-5 h-5 text-red-600" />
//                         </button>
//                       </div>
//                   ))}
//                   <button
//                       type="button"
//                       onClick={() => addArrayField("allergies")}
//                       className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
//                   >
//                     <Plus className="w-5 h-5" />
//                     <span className="text-sm">Add Allergy Detail</span>
//                   </button>
//                   {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>}
//                 </div>
//               </div>
//             </div>
//
//             {/* Actions */}
//             <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//               <button
//                   type="button"
//                   onClick={onClose}
//                   className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//               >
//                 {submitting && (
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 )}
//                 <span>{isEdit ? "Update Patient" : "Add Patient"}</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//   )
// }
//
// export default AddEditPatientModal
"use client"

import { useState, useEffect } from "react"
import { patientsAPI, usersAPI } from "../../services/api"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  X,
  UserPlus,
  AlertCircle,
  MapPin,
  FileText,
  Plus,
  Minus,
  Ruler,
  Weight,
} from "lucide-react"

const AddEditPatientModal = ({ isOpen, onClose, patient = null, onSuccess }) => {
  const isEdit = !!patient

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    status: "Active",
    avatar: "",
    allergies: [""],
    emergencyContact: {
      name: "",
      relation: "",
      phone: "",
    },
    nextAppointment: "",
    address: "",
    dateOfBirth: "",
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const genderOptions = ["Male", "Female", "Other"]
  const statusOptions = ["Active", "Inactive", "Critical"]
  const relationOptions = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]

  useEffect(() => {
    if (isOpen && isEdit && patient) {
      // Map patient data from backend structure to form structure
      const patientName =
          patient.User?.first_name && patient.User?.last_name
              ? `${patient.User.first_name} ${patient.User.last_name}`
              : patient.name || ""

      setFormData({
        name: patientName,
        email: patient.User?.email || patient.email || "",
        phone: patient.User?.phone || patient.phone || "",
        age: patient.age || "",
        gender: patient.gender || "",
        bloodType: patient.blood_type || patient.bloodType || "",
        height: patient.height || "",
        weight: patient.weight || "",
        status: patient.status || "Active",
        avatar: patient.avatar || "",
        allergies: patient.allergies
            ? Array.isArray(patient.allergies)
                ? patient.allergies
                : [patient.allergies]
            : [""],
        emergencyContact: {
          name: patient.emergency_contact?.name || patient.emergencyContact?.name || "",
          relation: patient.emergency_contact?.relation || patient.emergencyContact?.relation || "",
          phone: patient.emergency_contact?.phone || patient.emergencyContact?.phone || "",
        },
        nextAppointment: patient.nextAppointment || "",
        address: patient.address || "",
        dateOfBirth: patient.date_of_birth || patient.dateOfBirth || "",
      })
    } else if (isOpen && !isEdit) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        bloodType: "",
        height: "",
        weight: "",
        status: "Active",
        avatar: "",
        allergies: [""],
        emergencyContact: {
          name: "",
          relation: "",
          phone: "",
        },
        nextAppointment: "",
        address: "",
        dateOfBirth: "",
      })
    }
    setErrors({})
  }, [isOpen, isEdit, patient])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.age || formData.age < 1 || formData.age > 150) newErrors.age = "Valid age is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.bloodType) newErrors.bloodType = "Blood type is required"
    if (formData.height && (isNaN(formData.height) || formData.height <= 0))
      newErrors.height = "Height must be a valid number"
    if (formData.weight && (isNaN(formData.weight) || formData.weight <= 0))
      newErrors.weight = "Weight must be a valid number"
    if (!formData.emergencyContact.name.trim())
      newErrors["emergencyContact.name"] = "Emergency contact name is required"
    if (!formData.emergencyContact.phone.trim())
      newErrors["emergencyContact.phone"] = "Emergency contact phone is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      // Split name into first_name and last_name
      const nameParts = formData.name.trim().split(" ")
      const first_name = nameParts[0] || ""
      const last_name = nameParts.slice(1).join(" ") || ""

      let user_id = null

      if (!isEdit) {
        // Step 1: Create User record first (like in seedUsers.js)
        const userData = {
          email: formData.email,
          password: "password123", // Using same default as seedUsers.js
          first_name,
          last_name,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender,
          status: "Active",
          role: 8, // Include role in the initial request
        }

        console.log("Creating user with data:", userData)
        const userResponse = await usersAPI.create(userData)
        console.log("User created:", userResponse.data)
        user_id = userResponse.data.data.user.id
      } else if (patient.User) {
        // For editing, update the existing user
        user_id = patient.User.id
        const userData = {
          first_name,
          last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender,
        }
        await usersAPI.update(user_id, userData)
      }

      // Step 3: Create/Update Patient record with user_id (like in seedUsers.js)
      const patientData = {
        user_id: user_id,
        blood_type: formData.bloodType,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        allergies: formData.allergies.filter((item) => item.trim() !== ""),
        current_medications: null,
        insurance_provider: null,
        insurance_policy_number: null,
        emergency_contact_name: formData.emergencyContact.name,
        emergency_contact_relation: formData.emergencyContact.relation,
        emergency_contact_phone: formData.emergencyContact.phone,
        address: formData.address,
        city: null,
        state: null,
        postal_code: null,
        country: null,
        status: formData.status,
      }

      console.log("Creating/updating patient with data:", patientData)

      let response
      if (isEdit) {
        response = await patientsAPI.update(patient.id, patientData)
      } else {
        response = await patientsAPI.create(patientData)
      }

      console.log(`Patient ${isEdit ? "updated" : "created"} successfully:`, response.data)

      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} patient:`, error)

      let errorMessage = `Failed to ${isEdit ? "update" : "create"} patient. Please try again.`

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const validationErrors = {}
        error.response.data.errors.forEach((err) => {
          validationErrors[err.path || err.param] = err.msg
        })
        setErrors(validationErrors)
        return
      } else if (error.message) {
        errorMessage = error.message
      }

      setErrors({ general: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
      bloodType: "",
      height: "",
      weight: "",
      status: "Active",
      avatar: "",
      allergies: [""],
      emergencyContact: {
        name: "",
        relation: "",
        phone: "",
      },
      nextAppointment: "",
      address: "",
      dateOfBirth: "",
    })
    setErrors({})
  }

  if (!isOpen) return null

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? "Edit Patient" : "Add New Patient"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isEdit ? "Update patient information" : "Enter patient information and medical details"}
                  </p>
                </div>
              </div>
              <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Error Message */}
            {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300">{errors.general}</span>
                  </div>
                </div>
            )}

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age *</label>
                  <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.age ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter age"
                      min="1"
                      max="150"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                  <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.gender ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Type *</label>
                  <div className="relative">
                    <Heart className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select blood type</option>
                      {bloodTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                      ))}
                    </select>
                  </div>
                  {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.height ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter height in cm"
                        min="0"
                        step="0.1"
                    />
                  </div>
                  {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
                  <div className="relative">
                    <Weight className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.weight ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter weight in kg"
                        min="0"
                        step="0.1"
                    />
                  </div>
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors.dateOfBirth ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter full address"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emergency Contact *
                  </label>
                  <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors["emergencyContact.name"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter emergency contact name"
                  />
                  {errors["emergencyContact.name"] && (
                      <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.name"]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relation</label>
                  <select
                      name="emergencyContact.relation"
                      value={formData.emergencyContact.relation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select relation</option>
                    {relationOptions.map((relation) => (
                        <option key={relation} value={relation}>
                          {relation}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            errors["emergeryContact.phone"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter emergency contact phone"
                    />
                  </div>
                  {errors["emergencyContact.phone"] && (
                      <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.phone"]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</label>
                  {formData.allergies.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange("allergies", index, e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter allergy detail"
                        />
                        <button
                            type="button"
                            onClick={() => removeArrayField("allergies", index)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
                        >
                          <Minus className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                  ))}
                  <button
                      type="button"
                      onClick={() => addArrayField("allergies")}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Add Allergy Detail</span>
                  </button>
                  {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isEdit ? "Update Patient" : "Add Patient"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}

export default AddEditPatientModal