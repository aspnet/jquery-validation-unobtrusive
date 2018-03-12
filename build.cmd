<Project>
    <ItemGroup>
        <VersionFile Include="version"/>
    </ItemGroup>
    <PropertyGroup>
        <NuspecPath>Microsoft.jQuery.Unobtrusive.Validation.nuspec</NuspecPath>
    </PropertyGroup>
    <Target Name="Build">
        <ReadLinesFromFile File="@(VersionFile)">
            <Output TaskParameter="Lines" PropertyName="PackageVersion"/>
        </ReadLinesFromFile>
        <Exec Command="npm version --no-git-tag-version --allow-same-version $(PackageVersion)" />
        <Exec Command="gulp" />
        <Exec Command="nuget pack $(NuspecPath) -Version $(PackageVersion)" />
    </Target>
</Project>