import { redirect } from "next/navigation";
import { getAccessToken, getRefreshToken } from "@/lib/session";

export default async function RootPage() {
  const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);
  redirect(accessToken || refreshToken ? "/dashboard" : "/login");
}
