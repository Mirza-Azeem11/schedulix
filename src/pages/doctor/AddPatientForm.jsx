// "use client"
//
// import { useState } from "react"
// import { X, User, Heart, AlertTriangle, UserPlus, Upload, Plus, Minus } from "lucide-react"
// import { getPatientAvatar, handleImageError } from '../../utils/imageUtils'
//
// const AddPatient = ({ isOpen, onClose, onAddPatient }) => {
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         phone: "",
//         age: "",
//         gender: "",
//         bloodType: "",
//         status: "Active",
//         avatar: "",
//         medicalHistory: [""],
//         allergies: [""],
//         emergencyContact: {
//             name: "",
//             relation: "",
//             phone: "",
//         },
//         nextAppointment: "",
//         address: "",
//         dateOfBirth: "",
//     })
//
//     const [errors, setErrors] = useState({})
//
//     const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
//     const genderOptions = ["Male", "Female", "Other"]
//     const statusOptions = ["Active", "Inactive", "Critical"]
//     const relationOptions = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]
//
//     const handleInputChange = (e) => {
//         const { name, value } = e.target
//         if (name.includes(".")) {
//             const [parent, child] = name.split(".")
//             setFormData((prev) => ({
//                 ...prev,
//                 [parent]: {
//                     ...prev[parent],
//                     [child]: value,
//                 },
//             }))
//         } else {
//             setFormData((prev) => ({
//                 ...prev,
//                 [name]: value,
//             }))
//         }
//         // Clear error when user starts typing
//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }))
//         }
//     }
//
//     const handleArrayChange = (field, index, value) => {
//         setFormData((prev) => ({
//             ...prev,
//             [field]: prev[field].map((item, i) => (i === index ? value : item)),
//         }))
//     }
//
//     const addArrayField = (field) => {
//         setFormData((prev) => ({
//             ...prev,
//             [field]: [...prev[field], ""],
//         }))
//     }
//
//     const removeArrayField = (field, index) => {
//         if (formData[field].length > 1) {
//             setFormData((prev) => ({
//                 ...prev,
//                 [field]: prev[field].filter((_, i) => i !== index),
//             }))
//         }
//     }
//
//     const validateForm = () => {
//         const newErrors = {}
//
//         if (!formData.name.trim()) newErrors.name = "Name is required"
//         if (!formData.email.trim()) newErrors.email = "Email is required"
//         else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
//         if (!formData.phone.trim()) newErrors.phone = "Phone is required"
//         if (!formData.age || formData.age < 1 || formData.age > 150) newErrors.age = "Valid age is required"
//         if (!formData.gender) newErrors.gender = "Gender is required"
//         if (!formData.bloodType) newErrors.bloodType = "Blood type is required"
//         if (!formData.emergencyContact.name.trim())
//             newErrors["emergencyContact.name"] = "Emergency contact name is required"
//         if (!formData.emergencyContact.phone.trim())
//             newErrors["emergencyContact.phone"] = "Emergency contact phone is required"
//
//         setErrors(newErrors)
//         return Object.keys(newErrors).length === 0
//     }
//
//     const handleSubmit = (e) => {
//         e.preventDefault()
//         if (validateForm()) {
//             const newPatient = {
//                 ...formData,
//                 id: Date.now().toString(),
//                 lastVisit: new Date().toISOString(),
//                 medicalHistory: formData.medicalHistory.filter((item) => item.trim() !== ""),
//                 allergies: formData.allergies.filter((item) => item.trim() !== ""),
//             }
//             onAddPatient(newPatient)
//             onClose()
//             resetForm()
//         }
//     }
//
//     const resetForm = () => {
//         setFormData({
//             name: "",
//             email: "",
//             phone: "",
//             age: "",
//             gender: "",
//             bloodType: "",
//             status: "Active",
//             avatar: "",
//             medicalHistory: [""],
//             allergies: [""],
//             emergencyContact: {
//                 name: "",
//                 relation: "",
//                 phone: "",
//             },
//             nextAppointment: "",
//             address: "",
//             dateOfBirth: "",
//         })
//         setErrors({})
//     }
//
//     if (!isOpen) return null
//
//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
//                                 <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                             </div>
//                             <div>
//                                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Patient</h2>
//                                 <p className="text-gray-600 dark:text-gray-400">Enter patient information and medical details</p>
//                             </div>
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                         >
//                             <X className="w-6 h-6 text-gray-500" />
//                         </button>
//                     </div>
//                 </div>
//
//                 <form onSubmit={handleSubmit} className="p-6 space-y-8">
//                     {/* Basic Information */}
//                     <div className="space-y-6">
//                         <div className="flex items-center space-x-2 mb-4">
//                             <User className="w-5 h-5 text-blue-600" />
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
//                         </div>
//
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <div className="lg:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
//                                 <div className="flex flex-col items-center space-y-3">
//                                     <img
//                                         src={getPatientAvatar({ name: formData.name, avatar: formData.avatar }, 100)}
//                                         alt="Patient Avatar"
//                                         className="w-24 h-24 rounded-full ring-4 ring-gray-200 dark:ring-gray-600 object-cover"
//                                         onError={(e) => handleImageError(e, 'patient')}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                                     >
//                                         <Upload className="w-4 h-4" />
//                                         <span>Upload Photo</span>
//                                     </button>
//                                 </div>
//                             </div>
//
//                             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         value={formData.name}
//                                         onChange={handleInputChange}
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                             errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                         }`}
//                                         placeholder="Enter full name"
//                                     />
//                                     {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                                 </div>
//
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Email Address *
//                                     </label>
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         value={formData.email}
//                                         onChange={handleInputChange}
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                             errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                         }`}
//                                         placeholder="Enter email address"
//                                     />
//                                     {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                                 </div>
//
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Phone Number *
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         name="phone"
//                                         value={formData.phone}
//                                         onChange={handleInputChange}
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                             errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                         }`}
//                                         placeholder="Enter phone number"
//                                     />
//                                     {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//                                 </div>
//
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Date of Birth
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="dateOfBirth"
//                                         value={formData.dateOfBirth}
//                                         onChange={handleInputChange}
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                     />
//                                 </div>
//
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age *</label>
//                                     <input
//                                         type="number"
//                                         name="age"
//                                         value={formData.age}
//                                         onChange={handleInputChange}
//                                         min="1"
//                                         max="150"
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                             errors.age ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                         }`}
//                                         placeholder="Enter age"
//                                     />
//                                     {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
//                                 </div>
//
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
//                                     <select
//                                         name="gender"
//                                         value={formData.gender}
//                                         onChange={handleInputChange}
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                             errors.gender ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                         }`}
//                                     >
//                                         <option value="">Select gender</option>
//                                         {genderOptions.map((option) => (
//                                             <option key={option} value={option}>
//                                                 {option}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
//                             <textarea
//                                 name="address"
//                                 value={formData.address}
//                                 onChange={handleInputChange}
//                                 rows={3}
//                                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                 placeholder="Enter full address"
//                             />
//                         </div>
//                     </div>
//
//                     {/* Medical Information */}
//                     <div className="space-y-6">
//                         <div className="flex items-center space-x-2 mb-4">
//                             <Heart className="w-5 h-5 text-red-600" />
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>
//                         </div>
//
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Type *</label>
//                                 <select
//                                     name="bloodType"
//                                     value={formData.bloodType}
//                                     onChange={handleInputChange}
//                                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                         errors.bloodType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                     }`}
//                                 >
//                                     <option value="">Select blood type</option>
//                                     {bloodTypes.map((type) => (
//                                         <option key={type} value={type}>
//                                             {type}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
//                                 <select
//                                     name="status"
//                                     value={formData.status}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                 >
//                                     {statusOptions.map((status) => (
//                                         <option key={status} value={status}>
//                                             {status}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Next Appointment
//                                 </label>
//                                 <input
//                                     type="datetime-local"
//                                     name="nextAppointment"
//                                     value={formData.nextAppointment}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                 />
//                             </div>
//                         </div>
//
//                         {/* Medical History */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical History</label>
//                             <div className="space-y-2">
//                                 {formData.medicalHistory.map((condition, index) => (
//                                     <div key={index} className="flex items-center space-x-2">
//                                         <input
//                                             type="text"
//                                             value={condition}
//                                             onChange={(e) => handleArrayChange("medicalHistory", index, e.target.value)}
//                                             className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             placeholder="Enter medical condition"
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => removeArrayField("medicalHistory", index)}
//                                             className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//                                             disabled={formData.medicalHistory.length === 1}
//                                         >
//                                             <Minus className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 ))}
//                                 <button
//                                     type="button"
//                                     onClick={() => addArrayField("medicalHistory")}
//                                     className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
//                                 >
//                                     <Plus className="w-4 h-4" />
//                                     <span>Add Medical Condition</span>
//                                 </button>
//                             </div>
//                         </div>
//
//                         {/* Allergies */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</label>
//                             <div className="space-y-2">
//                                 {formData.allergies.map((allergy, index) => (
//                                     <div key={index} className="flex items-center space-x-2">
//                                         <input
//                                             type="text"
//                                             value={allergy}
//                                             onChange={(e) => handleArrayChange("allergies", index, e.target.value)}
//                                             className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             placeholder="Enter allergy"
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => removeArrayField("allergies", index)}
//                                             className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//                                             disabled={formData.allergies.length === 1}
//                                         >
//                                             <Minus className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 ))}
//                                 <button
//                                     type="button"
//                                     onClick={() => addArrayField("allergies")}
//                                     className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
//                                 >
//                                     <Plus className="w-4 h-4" />
//                                     <span>Add Allergy</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Emergency Contact */}
//                     <div className="space-y-6">
//                         <div className="flex items-center space-x-2 mb-4">
//                             <AlertTriangle className="w-5 h-5 text-orange-600" />
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
//                         </div>
//
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Contact Name *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="emergencyContact.name"
//                                     value={formData.emergencyContact.name}
//                                     onChange={handleInputChange}
//                                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                         errors["emergencyContact.name"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                     }`}
//                                     placeholder="Enter contact name"
//                                 />
//                                 {errors["emergencyContact.name"] && (
//                                     <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.name"]}</p>
//                                 )}
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relationship</label>
//                                 <select
//                                     name="emergencyContact.relation"
//                                     value={formData.emergencyContact.relation}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                 >
//                                     <option value="">Select relationship</option>
//                                     {relationOptions.map((relation) => (
//                                         <option key={relation} value={relation}>
//                                             {relation}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Contact Phone *
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     name="emergencyContact.phone"
//                                     value={formData.emergencyContact.phone}
//                                     onChange={handleInputChange}
//                                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
//                                         errors["emergencyContact.phone"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                                     }`}
//                                     placeholder="Enter contact phone"
//                                 />
//                                 {errors["emergencyContact.phone"] && (
//                                     <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.phone"]}</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Form Actions */}
//                     <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//                         >
//                             <UserPlus className="w-4 h-4" />
//                             <span>Add Patient</span>
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }
//
// export default AddPatient
"use client"

import { useState } from "react"
import { X, User, Heart, AlertTriangle, UserPlus, Upload, Plus, Minus } from "lucide-react"
import { getPatientAvatar, handleImageError } from '../../utils/imageUtils'

const AddPatient = ({ isOpen, onClose, onAddPatient }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        bloodType: "",
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

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    const genderOptions = ["Male", "Female", "Other"]
    const statusOptions = ["Active", "Inactive", "Critical"]
    const relationOptions = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]

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
        if (!formData.emergencyContact.name.trim())
            newErrors["emergencyContact.name"] = "Emergency contact name is required"
        if (!formData.emergencyContact.phone.trim())
            newErrors["emergencyContact.phone"] = "Emergency contact phone is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            const newPatient = {
                ...formData,
                id: Date.now().toString(),
                lastVisit: new Date().toISOString(),
                allergies: formData.allergies.filter((item) => item.trim() !== ""),
            }
            onAddPatient(newPatient)
            onClose()
            resetForm()
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
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Patient</h2>
                                <p className="text-gray-600 dark:text-gray-400">Enter patient information and medical details</p>
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
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
                                <div className="flex flex-col items-center space-y-3">
                                    <img
                                        src={getPatientAvatar({ name: formData.name, avatar: formData.avatar }, 100)}
                                        alt="Patient Avatar"
                                        className="w-24 h-24 rounded-full ring-4 ring-gray-200 dark:ring-gray-600 object-cover"
                                        onError={(e) => handleImageError(e, 'patient')}
                                    />
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Upload Photo</span>
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
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
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && <p className="text red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age *</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="150"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.age ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                        placeholder="Enter age"
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
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter full address"
                            />
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Heart className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Type *</label>
                                <select
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors.bloodType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    <option value="">Select blood type</option>
                                    {bloodTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Next Appointment
                                </label>
                                <input
                                    type="datetime-local"
                                    name="nextAppointment"
                                    value={formData.nextAppointment}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Allergies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</label>
                            <div className="space-y-2">
                                {formData.allergies.map((allergy, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={allergy}
                                            onChange={(e) => handleArrayChange("allergies", index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Enter allergy"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeArrayField("allergies", index)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            disabled={formData.allergies.length === 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayField("allergies")}
                                    className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Allergy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contact Name *
                                </label>
                                <input
                                    type="text"
                                    name="emergencyContact.name"
                                    value={formData.emergencyContact.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors["emergencyContact.name"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                    placeholder="Enter contact name"
                                />
                                {errors["emergencyContact.name"] && (
                                    <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.name"]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relationship</label>
                                <select
                                    name="emergencyContact.relation"
                                    value={formData.emergencyContact.relation}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select relationship</option>
                                    {relationOptions.map((relation) => (
                                        <option key={relation} value={relation}>
                                            {relation}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contact Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="emergencyContact.phone"
                                    value={formData.emergencyContact.phone}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors["emergencyContact.phone"] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                    placeholder="Enter contact phone"
                                />
                                {errors["emergencyContact.phone"] && (
                                    <p className="text-red-500 text-sm mt-1">{errors["emergencyContact.phone"]}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Patient</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddPatient