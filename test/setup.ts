import 'jsdom-global/register';

declare global {
  interface Window {
    Date: any;
  }
}
window.Date = Date;

export default {};
