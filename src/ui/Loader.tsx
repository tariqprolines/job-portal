import { IsbUrl } from "../config/constent";

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
   <img src={`${IsbUrl}/templates/network/img/loader.gif`} alt="Loading" width="50" />
  </div>
);

export default Loader;

