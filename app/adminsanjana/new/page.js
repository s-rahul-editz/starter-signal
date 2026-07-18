import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../../lib/auth-check";
import PostForm from "../PostForm";

export default function NewPostPage() {
  if (!isAdminAuthenticated()) {
    redirect("/adminsanjana/login");
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">New post</div>
      <h1 style={{ fontSize: 28, margin: "8px 0 24px" }}>Write something.</h1>
      <PostForm />
    </div>
  );
}
