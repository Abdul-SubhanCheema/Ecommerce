using System;
using CloudinaryDotNet.Actions;

namespace API.Interfaces;

public interface IPhoto
{
    Task<UploadResult> UploadPhotoAsync(IFormFile file);
    Task<DeletionResult> DeletePhotoAsync(string publicId);
}
