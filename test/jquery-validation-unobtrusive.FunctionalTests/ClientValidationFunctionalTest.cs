// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Server.IntegrationTesting;
using Microsoft.AspNetCore.Testing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Testing;
using Xunit;
using Xunit.Abstractions;

namespace Jquery.Validation.Unobtrusive.FunctionalTests
{
    public class ClientValidationFunctionalTest : LoggedTest
    {
        public ClientValidationFunctionalTest(ITestOutputHelper output)
            : base(output)
        {
            Output = output;
        }

        public ITestOutputHelper Output { get; }

        [Fact]
        public async Task RunClientTests()
        {
            using (StartLog(out var loggerFactory))
            using (var deploymentResult = await CreateDeployments(loggerFactory))
            {
                ProcessStartInfo processStartInfo;
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    processStartInfo = new ProcessStartInfo
                    {
                        FileName = "cmd",
                        Arguments = "/c npm test --no-color",
                    };
                }
                else
                {
                    processStartInfo = new ProcessStartInfo
                    {
                        FileName = "npm",
                        Arguments = "test",
                    };
                }

                // Act
                var result = await ProcessManager.RunProcessAsync(processStartInfo);

                // Assert
                Assert.Success(result);
                Assert.Contains("Test Suites: 1 passed, 1 total", result.Output);
            }
        }

        private static async Task<ClientParametersDeploymentResult> CreateDeployments(ILoggerFactory loggerFactory)
        {
            var solutionPath = TestPathUtilities.GetSolutionRootDirectory("jquery-validation-unobtrusive");

            var runtimeFlavor = GetRuntimeFlavor();
            var applicationType = runtimeFlavor == RuntimeFlavor.Clr ? ApplicationType.Standalone : ApplicationType.Portable;

            var configuration =
#if RELEASE
                "Release";
#else
                "Debug";
#endif

            var clientValidationWebSiteParameters = new DeploymentParameters
            {
                RuntimeFlavor = runtimeFlavor,
                ServerType = ServerType.Kestrel,
                ApplicationPath = Path.Combine(solutionPath, "test", "Websites", "ClientValidationWebSite"),
                PublishApplicationBeforeDeployment = false,
                ApplicationType = applicationType,
                Configuration = configuration,
            };

            var clientValidationWebSiteFactory = ApplicationDeployerFactory.Create(clientValidationWebSiteParameters, loggerFactory);
            var clientValidationWebSiteDeployment = await clientValidationWebSiteFactory.DeployAsync();

            return new ClientParametersDeploymentResult(clientValidationWebSiteFactory, clientValidationWebSiteDeployment);
        }

        private static RuntimeFlavor GetRuntimeFlavor()
        {
#if NET461
                return RuntimeFlavor.Clr;
#elif NETCOREAPP2_2
            return RuntimeFlavor.CoreClr;
#else
#error Target frameworks need to be updated
#endif
        }

        private readonly struct ClientParametersDeploymentResult : IDisposable
        {
            public ClientParametersDeploymentResult(
                ApplicationDeployer clientValidationWebSiteDeployer,
                DeploymentResult clientValidationWebSiteResult)
            {
                ClientValidationWebSiteDeployer = clientValidationWebSiteDeployer;
                ClientValidationWebSiteResult = clientValidationWebSiteResult;
            }

            public ApplicationDeployer ClientValidationWebSiteDeployer { get; }

            public DeploymentResult ClientValidationWebSiteResult { get; }

            public void Dispose()
            {
                ClientValidationWebSiteDeployer.Dispose();
            }
        }
    }
}
