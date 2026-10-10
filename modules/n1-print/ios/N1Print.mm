#import "N1Print.h"

#import <UIKit/UIKit.h>

// US Letter in points; the print system re-flows the page to the paper chosen.
static const CGRect kPageFrame = {{0, 0}, {612, 792}};

@implementation N1Print {
  // Held until the dialog closes: the formatter reads from the live web view.
  WKWebView *_webView;
  NSString *_jobName;
  RCTPromiseResolveBlock _resolve;
  RCTPromiseRejectBlock _reject;
}

+ (NSString *)moduleName
{
  return @"N1Print";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeN1PrintSpecJSI>(params);
}

- (void)printHtml:(NSString *)html
          jobName:(NSString *)jobName
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_webView != nil) {
      reject(@"E_BUSY", @"A page is already printing", nil);
      return;
    }
    self->_jobName = jobName;
    self->_resolve = resolve;
    self->_reject = reject;
    self->_webView = [[WKWebView alloc] initWithFrame:kPageFrame];
    self->_webView.navigationDelegate = self;
    [self->_webView loadHTMLString:html baseURL:nil];
  });
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation
{
  UIPrintInfo *info = [UIPrintInfo printInfo];
  info.outputType = UIPrintInfoOutputGeneral;
  info.jobName = _jobName;
  UIPrintInteractionController *controller = [UIPrintInteractionController sharedPrintController];
  controller.printInfo = info;
  controller.printFormatter = webView.viewPrintFormatter;
  [controller presentAnimated:YES
            completionHandler:^(UIPrintInteractionController *_, BOOL __, NSError *error) {
              if (error != nil) {
                [self finishWithError:error];
              } else {
                // Printed or cancelled: either way the dialog did its job.
                self->_resolve(nil);
                [self reset];
              }
            }];
}

- (void)webView:(WKWebView *)webView
    didFailNavigation:(WKNavigation *)navigation
            withError:(NSError *)error
{
  [self finishWithError:error];
}

- (void)webView:(WKWebView *)webView
    didFailProvisionalNavigation:(WKNavigation *)navigation
                       withError:(NSError *)error
{
  [self finishWithError:error];
}

- (void)finishWithError:(NSError *)error
{
  _reject(@"E_PRINT", error.localizedDescription, error);
  [self reset];
}

- (void)reset
{
  _webView.navigationDelegate = nil;
  _webView = nil;
  _resolve = nil;
  _reject = nil;
}

@end
