// app/tools/shipping-manager/forms/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  // /tools/shipping-manager/forms に来たら必ず認証画面へ
  redirect("/tools/shipping-manager/forms/entry");
}
