import { deleteRequest, getRequest, postRequest } from "@utils/http/request-sse";

export async function getSpxAccountApi(): Promise<{ connected: boolean }> {
  return getRequest<{ connected: boolean }>("/me/spx/account");
}

export async function createSpxAccountApi(payload: {
  phone: string;
  email?: string;
}): Promise<{ connected: boolean }> {
  return postRequest<{ connected: boolean }>("/me/spx/account", payload);
}

export async function deleteSpxAccountApi(): Promise<void> {
  return deleteRequest<void>("/me/spx/account");
}
