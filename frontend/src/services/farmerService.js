import api from './api';

/**
 * services/farmerService.js — farmer profile reads/writes.
 * Matches routes/farmerRoutes.js + controllers/farmerController.js exactly:
 *   GET   /api/farmer/profile        (own profile, auth required)
 *   GET   /api/farmer/profile/:id    (public profile view)
 *   POST  /api/farmer/profile        (create — auth + role=farmer)
 *   PUT   /api/farmer/profile        (update — auth + role=farmer)
 *
 * Note: registering as a farmer (see pages/Register.jsx) already creates the
 * FarmerProfile document server-side (authController.registerUser), so
 * createFarmerProfile below mostly exists for completeness / re-creating a
 * missing profile — the everyday path is getFarmerProfile + updateFarmerProfile.
 *
 * All responses follow the shared shape: { success, data, message }.
 */

function buildProfileFormData(fields = {}, photoFile) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  if (photoFile) {
    // Matches uploadMiddleware.js's uploadSingle: upload.single('image')
    formData.append('image', photoFile);
  }
  return formData;
}

export async function getFarmerProfile() {
  const res = await api.get('/farmer/profile');
  return res.data;
}

export async function getPublicFarmerProfile(userId) {
  const res = await api.get(`/farmer/profile/${userId}`);
  return res.data;
}

export async function createFarmerProfile(fields, photoFile) {
  const formData = buildProfileFormData(fields, photoFile);
  const res = await api.post('/farmer/profile', formData);
  return res.data;
}

// `photoFile` is optional — when omitted, this sends plain JSON (no new
// photo to upload); when present, it sends multipart/form-data so Multer
// can pick up the `image` field alongside the rest of the profile fields.
export async function updateFarmerProfile(fields, photoFile) {
  if (photoFile) {
    const formData = buildProfileFormData(fields, photoFile);
    const res = await api.put('/farmer/profile', formData);
    return res.data;
  }
  const res = await api.put('/farmer/profile', fields);
  return res.data;
}
