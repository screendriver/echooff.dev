declare global {
  interface Window {
    Date: any;
  }
}
window.Date = Date;

export default {};
