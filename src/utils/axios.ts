import { AxiosError } from "axios";

export function isAxiosError(err: any): err is AxiosError {
  if (!err) return false;
  return (err as AxiosError).isAxiosError !== undefined;
}