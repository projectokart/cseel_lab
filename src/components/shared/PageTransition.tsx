import { motion } from "framer-motion";



interface PageTransitionProps {

  children: React.ReactNode;

}



const PageTransition = ({ children }: PageTransitionProps) => (

  <motion.div

    initial={{ opacity: 0, y: 20 }}

    animate={{ opacity: 1, y: 0 }}

    exit={{ opacity: 0, y: -10 }}

    transition={{ duration: 0.3, ease: "easeOut" }}

  >

    {children}

  </motion.div>

);



export default PageTransition;
