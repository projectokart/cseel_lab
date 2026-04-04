import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
    <h1 className="text-6xl font-bold text-primary">404</h1>
    <p className="text-xl text-muted-foreground">Page not found</p>
    <Link to="/" className="text-primary underline">Go home</Link>
  </div>
);

export default NotFound;
