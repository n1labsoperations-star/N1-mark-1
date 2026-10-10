require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "n1-print"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/n1labsoperations-star"
  s.license      = package["license"]
  s.authors      = "N1 Labs"
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :path => "." }
  s.source_files = "ios/**/*.{h,m,mm}"
  s.frameworks   = "WebKit"

  install_modules_dependencies(s)
end
