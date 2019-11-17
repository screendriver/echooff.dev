import 'jsdom-global/register';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

declare global {
  interface Window {
    Date: any;
  }
}
window.Date = Date;

export default {};
