import React, { useState, useRef } from 'react';
import { Upload, X, Download, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [resizeOption, setResizeOption] = useState('original');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [scalePercent, setScalePercent] = useState('100');
  const [optimize, setOptimize] = useState(true);
  const [smartFocus, setSmartFocus] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertedImage, setConvertedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
      setConvertedImage(null);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const convertImage = () => {
    if (!file) return;
    
    setConverting(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      
      if (resizeOption === 'custom' && customWidth && customHeight) {
        width = parseInt(customWidth);
        height = parseInt(customHeight);
      } else if (resizeOption === 'scale' && scalePercent) {
        const scale = parseInt(scalePercent) / 100;
        width = Math.round(img.width * scale);
        height = Math.round(img.height * scale);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (smartFocus && resizeOption !== 'original') {
        const aspectRatio = width / height;
        const imgAspectRatio = img.width / img.height;
        
        if (aspectRatio !== imgAspectRatio) {
          let sx, sy, sWidth, sHeight;
          if (imgAspectRatio > aspectRatio) {
            sHeight = img.height;
            sWidth = img.height * aspectRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          } else {
            sWidth = img.width;
            sHeight = img.width / aspectRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      const quality = optimize ? 0.85 : 0.95;
      let mimeType = 'image/jpeg';
      
      switch(outputFormat) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        default:
          mimeType = 'image/jpeg';
      }
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setConvertedImage({ url, blob, mimeType });
        setConverting(false);
      }, mimeType, quality);
    };
    
    img.src = preview;
  };

  const downloadImage = () => {
    if (!convertedImage) return;
    
    const link = document.createElement('a');
    link.href = convertedImage.url;
    const fileName = file.name.split('.')[0];
    link.download = `${fileName}_converted.${outputFormat}`;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setConvertedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">UseBestTools</span>
            </div>
            <div className="hidden md:flex space-x-6 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/blog" className="text-gray-600 hover:text-gray-900">Blog</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Free Image Format Converter</h1>
          <p className="text-lg text-gray-600">Convert between JPG, PNG, WebP, HEIC and other formats instantly - no sign up required.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Click to upload or drag and drop</h3>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG, WEBP, GIF, HEIC up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Select Image
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <img src={preview} alt="Preview" className="max-h-64 rounded-lg mx-auto" />
                  <p className="text-sm text-gray-600 mt-2 text-center">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                </div>
                <button onClick={reset} className="ml-4 p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resize Option</label>
                  <select
                    value={resizeOption}
                    onChange={(e) => setResizeOption(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="original">Keep original size</option>
                    <option value="custom">Custom dimensions</option>
                    <option value="scale">Scale by percentage</option>
                  </select>
                </div>
              </div>

              {resizeOption === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder="800"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="600"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {resizeOption === 'scale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scale (%)</label>
                  <input
                    type="number"
                    value={scalePercent}
                    onChange={(e) => setScalePercent(e.target.value)}
                    placeholder="100"
                    min="1"
                    max="200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optimize}
                    onChange={(e) => setOptimize(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Optimize image quality</span>
                </label>

                {resizeOption !== 'original' && (
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartFocus}
                      onChange={(e) => setSmartFocus(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Smart subject focus (when resizing)</span>
                  </label>
                )}
              </div>

              <button
                onClick={convertImage}
                disabled={converting}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <span>Convert to {outputFormat.toUpperCase()}</span>
                )}
              </button>

              {convertedImage && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Converted Image</h3>
                  <img src={convertedImage.url} alt="Converted" className="max-h-64 rounded-lg mx-auto mb-4" />
                  <button
                    onClick={downloadImage}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Image</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-xs text-gray-500 mb-1">Most Popular</div>
            <div className="font-semibold text-gray-900">HEIC to JPG</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-xs text-gray-500 mb-1">Popular</div>
            <div className="font-semibold text-gray-900">PNG to JPG</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-xs text-gray-500 mb-1">Popular</div>
            <div className="font-semibold text-gray-900">WebP to JPG</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-xs text-gray-500 mb-1">Popular</div>
            <div className="font-semibold text-gray-900">JPG to PNG</div>
          </div>
        </div>
      </div>
    </div>
  );
}
