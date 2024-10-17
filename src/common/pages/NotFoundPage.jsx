import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <>
      <h2>Not found this page</h2>
      <h3>This page does't exist in this App</h3>
      <Link to="/">Back to main page</Link>
    </>
  );
}

export default NotFoundPage;
