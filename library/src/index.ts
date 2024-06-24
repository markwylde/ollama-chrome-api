export function authorize () {
  let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=100,left=100,top=100`;
  const host = window.location.hostname
  window.open(`chrome-extension://nmeeoodckmcdmmjbalnamgobjekjamkl/request.html?host=${host}`, null, params);
}
