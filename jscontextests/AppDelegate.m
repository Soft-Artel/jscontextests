//
//  AppDelegate.m
//  jscontextests
//
//  Created by Nikolay Ilin on 07.05.15.
//  Copyright (c) 2015 Soft-Artel. All rights reserved.
//

#import "AppDelegate.h"

@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    
    
    @autoreleasepool {
        JSContext *context = [[JSContext alloc] initWithVirtualMachine:[[JSVirtualMachine alloc] init]];
        
        [context evaluateScript:@"var console = {};"];
        context[@"console"][@"log"] = ^(NSString *message) {
            NSLog(@"JavaScript console: %@",message);
        };
        
        context[@"modelQuery"] = ^(NSString *query) {
            NSLog(@"modelQuery start with query: %@",query);
            sleep( 1 );
            NSString *someModelResult = @"{\"result\":123}";
            NSLog(@"modelQuery end: %@",query);
            return someModelResult;
        };
        

        __block __weak AppDelegate * safeSelf = self;
        
        context[@"sendResult"] = ^(NSString *result) {
            // self.res = [result copy];
            NSLog(@"sendResult with args: %@", result );
        };

        [context setExceptionHandler:^(JSContext *context, JSValue *value) {
            NSLog(@"JavaScript exception: %@", value);
        }];
        
        
        // NSString* filePath = [[NSBundle mainBundle] pathForResource:@"test-smartDate-ios-ru" ofType:@"js" inDirectory:@""];
        
        NSString* filePath = [[NSBundle mainBundle] pathForResource:@"smartDate-ios-ru" ofType:@"js" inDirectory:@""];

        NSString * jsCode = [NSString stringWithContentsOfFile: filePath
                                                      encoding:NSUTF8StringEncoding
                                                        error:nil];
        // NSLog(@"Start tests...");

        [context evaluateScript: jsCode ];

        NSLog(@"Calling parseText(...)");
        [context evaluateScript:@"parseText(\"Завтра 10 совещание\");"];
        

        // This needs to get nil'd before deallocation
        context.exception = nil;
    }
    
    
    
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

@end
