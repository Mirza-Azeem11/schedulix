import React, { useState, useEffect } from "react";
import {useAppDispatch, useRoles} from "../../hooks/useRedux";
import { createUser, updateUser } from "../../../slices/userSlice";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {fetchRoles} from "../../../slices/roleSlice";
const AddEditUserModal = ({ isOpen, onClose, user = null, onSuccess }) => {

  const dispatch = useAppDispatch();
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    status: "Active",
    role: "", // ✅ only one role, not array
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { roles, loading } = useRoles();

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

// Apply filtering
  const availableRoles = roles.filter(
      role => role.name?.toLowerCase() !== "patient"
  );

  useEffect(() => {
    if (isOpen && isEdit && user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
        status: user.status || "Active",
        role: user.role || "", // ✅ single role string
      });
    } else if (isOpen && !isEdit) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        status: "Active",
        role: "", // ✅ blank at start
      });
    }
    setErrors({});
  }, [isOpen, isEdit, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone))
      newErrors.phone = "Phone number is invalid";

    if (!isEdit) {
      if (!formData.password)
        newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Confirm password is required";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    } else if (formData.password) {
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role)
      newErrors.role = "You must select a role"; // ✅ single role

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        role: formData.role, // ✅ single role string
      };

      if (!isEdit || formData.password) {
        userData.password = formData.password;
      }

      if (isEdit) {
        await dispatch(updateUser({ id: user.id, userData })).unwrap();
      } else {
        await dispatch(createUser(userData)).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      setErrors({
        submit:
          error.message || `Failed to ${isEdit ? "update" : "create"} user`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter first name"
                />
              </div>
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter last name"
                />
              </div>
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password {!isEdit && "*"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={
                    isEdit ? "Leave blank to keep current" : "Enter password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password {!isEdit && "*"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <div className="flex space-x-4">
              {["Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleInputChange("status", status)}
                  className={`px-4 py-2 border rounded-lg ${
  formData.status === status
      ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Single Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role *
            </label>
            <div className="space-y-3">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
  formData.role === role.id
      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
}`}
                  onClick={() => handleInputChange("role", role.id)} // ✅ single-select
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
  formData.role === role.id
      ? "border-blue-500 bg-blue-500"
      : "border-gray-300 dark:border-gray-600"
}`}
                    >
                      {formData.role === role.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{isEdit ? "Update User" : "Create User"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditUserModal;


// import React, { useState, useEffect } from 'react';
// import { useAppDispatch } from '../../hooks/useRedux';
// import { useUsers } from '../../hooks/useRedux';
// import { createUser, updateUser } from '../../../slices/userSlice';
// import {
//   User,
//   Mail,
//   Phone,
//   Lock,
//   Shield,
//   X,
//   Check,
//   AlertCircle,
//   Eye,
//   EyeOff
// } from 'lucide-react';
//
// const AddEditUserModal = ({ isOpen, onClose, user = null, onSuccess }) => {
//   const dispatch = useAppDispatch();
//   const isEdit = !!user;
//
//   const [formData, setFormData] = useState({
//     first_name: '',
//     last_name: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     status: 'Active',
//     roles: []
//   });
//
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//
//   const availableRoles = [
//     { id: 1, name: 'Admin', description: 'Full administrative access' },
//     { id: 2, name: 'Doctor', description: 'Healthcare provider access' },
//     { id: 3, name: 'Patient', description: 'Patient portal access' },
//     { id: 4, name: 'SuperAdmin', description: 'System administrator access' }
//   ];
//
//   useEffect(() => {
//     if (isOpen && isEdit && user) {
//       setFormData({
//         first_name: user.first_name || '',
//         last_name: user.last_name || '',
//         email: user.email || '',
//         phone: user.phone || '',
//         password: '',
//         confirmPassword: '',
//         status: user.status || 'Active',
//         roles: user.roles || []
//       });
//     } else if (isOpen && !isEdit) {
//       setFormData({
//         first_name: '',
//         last_name: '',
//         email: '',
//         phone: '',
//         password: '',
//         confirmPassword: '',
//         status: 'Active',
//         roles: []
//       });
//     }
//     setErrors({});
//   }, [isOpen, isEdit, user]);
//
//   const validateForm = () => {
//     const newErrors = {};
//
//     if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
//     if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
//
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
//
//     if (!isEdit) {
//       if (!formData.password) newErrors.password = 'Password is required';
//       else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
//
//       if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
//       else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
//     } else if (formData.password) {
//       if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
//       if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
//     }
//
//     if (formData.roles.length === 0) newErrors.roles = 'At least one role must be selected';
//
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     if (!validateForm()) return;
//
//     setSubmitting(true);
//     try {
//       const userData = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         phone: formData.phone,
//         status: formData.status,
//         roles: formData.roles
//       };
//
//       if (!isEdit || formData.password) {
//         userData.password = formData.password;
//       }
//
//       if (isEdit) {
//         await dispatch(updateUser({ id: user.id, userData })).unwrap();
//       } else {
//         await dispatch(createUser(userData)).unwrap();
//       }
//
//       onSuccess?.();
//       onClose();
//     } catch (error) {
//       setErrors({ submit: error.message || `Failed to ${isEdit ? 'update' : 'create'} user` });
//     } finally {
//       setSubmitting(false);
//     }
//   };
//
//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   };
//
//   const handleRoleToggle = (roleId) => {
//     const currentRoles = formData.roles;
//     const isSelected = currentRoles.includes(roleId);
//
//     if (isSelected) {
//       handleInputChange('roles', currentRoles.filter(id => id !== roleId));
//     } else {
//       handleInputChange('roles', [...currentRoles, roleId]);
//     }
//   };
//
//   if (!isOpen) return null;
//
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//             {isEdit ? 'Edit User' : 'Add New User'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>
//
//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Name Fields */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 First Name *
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   value={formData.first_name}
//                   onChange={(e) => handleInputChange('first_name', e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   placeholder="Enter first name"
//                 />
//               </div>
//               {errors.first_name && (
//                 <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
//               )}
//             </div>
//
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Last Name *
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   value={formData.last_name}
//                   onChange={(e) => handleInputChange('last_name', e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   placeholder="Enter last name"
//                 />
//               </div>
//               {errors.last_name && (
//                 <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
//               )}
//             </div>
//           </div>
//
//           {/* Email */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Email Address *
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => handleInputChange('email', e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="Enter email address"
//               />
//             </div>
//             {errors.email && (
//               <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
//             )}
//           </div>
//
//           {/* Phone */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Phone Number *
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => handleInputChange('phone', e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="Enter phone number"
//               />
//             </div>
//             {errors.phone && (
//               <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
//             )}
//           </div>
//
//           {/* Password Fields */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Password {!isEdit && '*'}
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={(e) => handleInputChange('password', e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
//               )}
//             </div>
//
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Confirm Password {!isEdit && '*'}
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={formData.confirmPassword}
//                   onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   placeholder="Confirm password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 >
//                   {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
//               )}
//             </div>
//           </div>
//
//           {/* Status */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Status
//             </label>
//             <div className="flex space-x-4">
//               {['Active', 'Inactive'].map((status) => (
//                 <button
//                   key={status}
//                   type="button"
//                   onClick={() => handleInputChange('status', status)}
//                   className={`px-4 py-2 border rounded-lg ${
//                     formData.status === status
//                       ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
//                       : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
//                   }`}
//                 >
//                   {status}
//                 </button>
//               ))}
//             </div>
//           </div>
//
//           {/* Roles */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Roles *
//             </label>
//             <div className="space-y-3">
//               {availableRoles.map((role) => (
//                 <div
//                   key={role.id}
//                   className={`p-4 border rounded-lg cursor-pointer transition-colors ${
//                     formData.roles.includes(role.id)
//                       ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                       : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
//                   }`}
//                   onClick={() => handleRoleToggle(role.id)}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
//                       formData.roles.includes(role.id)
//                         ? 'border-blue-500 bg-blue-500'
//                         : 'border-gray-300 dark:border-gray-600'
//                     }`}>
//                       {formData.roles.includes(role.id) && (
//                         <Check className="w-3 h-3 text-white" />
//                       )}
//                     </div>
//                     <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                     <div>
//                       <p className="font-medium text-gray-900 dark:text-white">{role.name}</p>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {errors.roles && (
//               <p className="text-sm text-red-600 dark:text-red-400">{errors.roles}</p>
//             )}
//           </div>
//
//           {/* Error Message */}
//           {errors.submit && (
//             <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//               <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
//               <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
//             </div>
//           )}
//
//           {/* Action Buttons */}
//           <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
//             >
//               {submitting ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               ) : (
//                 <>
//                   <Check className="w-5 h-5" />
//                   <span>{isEdit ? 'Update User' : 'Create User'}</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
//
// export default AddEditUserModal;
