import 'jsdom-global/register';

declare global {
  interface Window {
    Date: unknown;
  }
}
window.Date = Date;

export default {};
