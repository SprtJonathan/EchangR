import { useRouter } from "next/router";

export default function RefreshRouter() {
  const router = useRouter();

  router.reload();
}
