// User type
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'Admin'|'Doctor'|'Patient'|'Staff'} role
 * @property {'Active'|'Inactive'|'Suspended'} status
 * @property {string} avatar
 * @property {string} joinDate
 * @property {string} lastLogin
 * @property {string} [department]
 * @property {number} [patients]
 */

// Role type
/**
 * @typedef {Object} Role
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} permissions
 * @property {number} userCount
 * @property {string} color
 */

// Payment type
/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} patient
 * @property {number} amount
 * @property {'Completed'|'Pending'|'Failed'|'Refunded'} status
 * @property {string} date
 * @property {'Card'|'Cash'|'Insurance'|'Transfer'} method
 * @property {string} invoice
 */

// Stat type
/**
 * @typedef {Object} Stat
 * @property {string} title
 * @property {string} value
 * @property {string} change
 * @property {'up'|'down'|'neutral'} trend
 * @property {string} icon
 * @property {string} color
 */

// Theme type
// @typedef {'light'|'dark'} Theme

// NavigationItem type
/**
 * @typedef {Object} NavigationItem
 * @property {string} id
 * @property {string} label
 * @property {string} icon
 * @property {string} href
 * @property {string} [badge]
 */
