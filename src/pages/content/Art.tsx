// Art.tsx now redirects to the ExperimentDetail page
// This file is kept for backward compatibility with /art route
import { Navigate } from "react-router-dom";

const Art = () => {
  return <Navigate to="/simulations" replace />;
};

export default Art;
