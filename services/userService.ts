import api, { getBaseUrl } from "./api";

export async function getProfilePicture(email: string | null) {
  if (!email) throw new Error("Email is required");

  const res = await api.get(`/upload/${email}`);
  return {
    email: res.data.email,
    profile_picture: res.data.profile_picture
      ? `${getBaseUrl()}${res.data.profile_picture}`
      : null,
  };
}

export async function uploadProfilePicture(email: string | null, uri: string, filename?: string) {
  if (!email) throw new Error("Email is required");

  let name = filename || uri.split("/").pop() || `profile_${Date.now()}.jpg`;
  if (!/\.(jpg|jpeg|png)$/i.test(name)) {
    name += ".jpg";
  }

  const formData = new FormData();
  formData.append("image", {
    uri,                     // <-- use the local URI directly
    name,                    
  } as any); 

  const res = await api.post(`/upload/${email}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    email: res.data.email,
    profile_picture: res.data.profile_picture
      ? `${getBaseUrl()}${res.data.profile_picture}`
      : null,
  };
}


