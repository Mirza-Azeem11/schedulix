// Default image utility for handling missing images
export const getDefaultImage = (type = 'user') => {
  const defaultImages = {
    user: 'https://ui-avatars.com/api/?name=User&background=e2e8f0&color=475569&size=128',
    doctor: 'https://ui-avatars.com/api/?name=Doctor&background=dbeafe&color=1e40af&size=128',
    patient: 'https://ui-avatars.com/api/?name=Patient&background=dcfce7&color=166534&size=128',
    avatar: 'https://ui-avatars.com/api/?name=U&background=f1f5f9&color=64748b&size=128',
    profile: 'https://ui-avatars.com/api/?name=Profile&background=fef3c7&color=92400e&size=200',
    placeholder: 'https://ui-avatars.com/api/?name=Image&background=f3f4f6&color=6b7280&size=200'
  };

  return defaultImages[type] || defaultImages.placeholder;
};

// Generate avatar with initials
export const getAvatarWithInitials = (name, size = 128, bgColor = 'e2e8f0', textColor = '475569') => {
  if (!name) return getDefaultImage('avatar');

  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=${textColor}&size=${size}`;
};

// Handle image error by setting default image
export const handleImageError = (event, fallbackType = 'user') => {
  event.target.src = getDefaultImage(fallbackType);
};

// Get user avatar with fallback
export const getUserAvatar = (user, size = 128) => {
  if (user?.avatar_url) return user.avatar_url;

  const name = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name || user?.last_name || user?.name || 'User';

  return getAvatarWithInitials(name, size);
};

// Get patient avatar with fallback
export const getPatientAvatar = (patient, size = 128) => {
  if (patient?.avatar || patient?.User?.avatar_url) {
    return patient.avatar || patient.User.avatar_url;
  }

  const name = patient?.User?.first_name && patient?.User?.last_name
    ? `${patient.User.first_name} ${patient.User.last_name}`
    : patient?.name || 'Patient';

  return getAvatarWithInitials(name, size, 'dcfce7', '166534');
};

// Get doctor avatar with fallback
export const getDoctorAvatar = (doctor, size = 128) => {
  if (doctor?.avatar || doctor?.User?.avatar_url) {
    return doctor.avatar || doctor.User.avatar_url;
  }

  const name = doctor?.User?.first_name && doctor?.User?.last_name
    ? `Dr. ${doctor.User.first_name} ${doctor.User.last_name}`
    : doctor?.name || 'Doctor';

  return getAvatarWithInitials(name, size, 'dbeafe', '1e40af');
};

