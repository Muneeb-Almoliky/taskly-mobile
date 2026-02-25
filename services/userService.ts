import api, { getBaseUrl } from "./api";

const formatImageUrl = (path: string) => {
  if (!path) return null;
  const baseUrl = getBaseUrl() || '';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export async function getProfilePicture(email: string | null) {
  if (!email) throw new Error("Email is required");

  const res = await api.get(`/upload/${email}`);
  return {
    email: res.data.email,
    profile_picture: formatImageUrl(res.data.profile_picture),
  };
}

export async function uploadProfilePicture(email: string | null, uri: string, filename?: string) {
  if (!email) throw new Error("Email is required");

  let name = filename || uri.split("/").pop() || `profile_${Date.now()}.jpg`;
  if (!/\.(jpg|jpeg|png)$/i.test(name)) {
    name += ".jpg";
  }

  let type = "image/jpeg";
  if (name.toLowerCase().endsWith(".png")) {
    type = "image/png";
  }

  const formData = new FormData();
  formData.append("image", {
    uri,
    name,
    type,
  } as any);

  const res = await api.post(`/upload/${email}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    email: res.data.email,
    profile_picture: formatImageUrl(res.data.profile_picture),
  };
}


