/**
 * Translates technical backend errors into user-friendly Vietnamese messages.
 * Never exposes raw HTTP 403, ConstraintViolationException, or SQL jargon to non-tech users.
 */
export function translateErrorMessage(error: any): string {
  if (!error) {
    return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
  }

  // If already an ApiError with translated or custom message
  const status = error.status || error.response?.status;
  const data = error.response?.data || error.data;

  // Check error key / title from Zalando Problem or custom exception
  const errorKey = data?.errorKey || data?.message || data?.title || data?.error;
  const detail = data?.detail;

  // Known backend error keys
  switch (errorKey) {
    case 'error.emailnotfound':
    case 'emailnotfound':
      return 'Không tìm thấy tài khoản với email này trong hệ thống.';

    case 'alreadyactivated':
    case 'error.alreadyactivated':
      return 'Tài khoản này đã được kích hoạt thành công từ trước.';

    case 'invalidactivationkey':
    case 'error.invalidactivationkey':
      return 'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ Quản trị viên để nhận liên kết mới.';

    case 'resetkeyinvalidorexpired':
    case 'error.resetkeyinvalidorexpired':
      return 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu quên mật khẩu.';

    case 'passwordlengthinvalid':
    case 'error.passwordlengthinvalid':
      return 'Độ dài mật khẩu không hợp lệ (từ 4 đến 100 ký tự).';

    case 'error.idnotfound':
    case 'idnotfound':
      return 'Không tìm thấy một số tài khoản được yêu cầu trong cơ sở dữ liệu.';

    case 'invalidids':
    case 'error.invalidids':
      return 'Danh sách mã tài khoản không hợp lệ.';

    case 'studentnotfound':
      return 'Không tìm thấy thông tin sinh viên yêu cầu.';

    case 'error.excel.invalid':
    case 'Excel file contains no student data.':
      return 'Tệp Excel không chứa dữ liệu sinh viên hợp lệ hoặc bị sai định dạng.';

    case 'Only .xlsx files are supported.':
      return 'Hệ thống chỉ hỗ trợ định dạng tệp Excel .xlsx.';

    case 'File must not be empty.':
      return 'Tệp Excel đã chọn bị rỗng.';

    case 'error.http.401':
    case 'Unauthorized':
      return 'Thông tin đăng nhập không chính xác hoặc phiên làm việc đã hết hạn.';

    case 'error.http.403':
    case 'Access Denied':
    case 'error.donotpermission':
      return 'Bạn không có quyền thực hiện thao tác này.';

    case 'Bad credentials':
      return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';

    case 'error.userexsist':
    case 'userexists':
      return 'Email này đã được sử dụng cho một tài khoản khác.';

    default:
      break;
  }

  // Check specific status codes
  if (status === 401) {
    return 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
  }

  if (status === 403) {
    return 'Tài khoản của bạn không đủ quyền hạn để thực hiện tác vụ này.';
  }

  if (status === 404) {
    return 'Dữ liệu yêu cầu không tồn tại trên hệ thống.';
  }

  if (status === 413) {
    return 'Dung lượng tệp tải lên vượt quá giới hạn cho phép (tối đa 5 MB).';
  }

  if (status >= 500) {
    return 'Máy chủ đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.';
  }

  if (detail && typeof detail === 'string' && !detail.includes('Exception') && !detail.includes('java.')) {
    return detail;
  }

  if (error.message && error.message.includes('Network Error')) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền internet.';
  }

  return 'Thao tác không thành công. Vui lòng kiểm tra lại thông tin và thử lại.';
}
