namespace API.Errors;

public class ApiExceptions(int code,string msg,string details)
{
    public string Message { get; set; } = msg;
    public string Details { get; set; } = details;
    public int StatusCode { get; set; } = code;

}
