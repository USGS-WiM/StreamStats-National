# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## [Unreleased](https://github.com/USGS-WiM/StreamStats-National/tree/dev)

### Added 

- Allows users to enter downstream distance in "Query by Fire Perimeters" workflow
- Descriptions to workflows and steps
- Added cursor attribute to workflows
- Basin characteristics computation to "Delineation" workflow

### Changed  

- Split 'Select a Fire Perimeter' step in 'Query by Fire Perimeters' workflow into two separate steps. The first is to select your fire perimeter the second it to start the trace
- Updated layout
- Fire perimeters labels 
- Pointer marker now points to clicked point instead of being centered on clicked point
- 'Overview' to 'Report'
- Print modal - spacing, moved buttons to bottom
- Only able to trace/select once fire perimeter at a time
- Remove all output workflow layers when workflow is complete
- Updated to google analytics 4
- Burn Severity is turned off by default for Fire Hydrology workflows
- Some checkboxes are now radio buttons where appropriate

### Deprecated 

-

### Removed 

- 

### Fixed  

- USGS search API library reference
- In print modal, description text not up taking full width of modal
- Only query fire perimeters that are visible
- Bug caused by switching between report and workflow that reset workflow variables which created errors

### Security  

- 

## [v1.2.0-beta](https://github.com/USGS-WiM/StreamStats-National/releases/tag/v1.2.0-beta) - 2022-07-14

### Added 

- Forests parameter from fire hydrology basin characteristics 
- ReadMe: project description, node version, deployment instructions, internal documentation

### Changed  

- Only print flow lines in 'Query by Fire Perimeters' workflow
- Authors in documentation
- NLDI polygon query URL

### Fixed  

- Issue where basin characteristics were getting overwritten by subsequent workflows
- Typo in version number in the About pop-up
- Dead link in documentation

## [v1.1.1-beta](https://github.com/USGS-WiM/StreamStats-National/releases/tag/v1.1.1-beta) - 2022-06-24


### Changed

-   Pointed 'Query by Fire Perimeters' option to new service: https://nldi-polygon-query.streamstats.usgs.gov/docs
-   Changed fire hydrology layers according to NIFC updates #194
 

## [v1.1.0-beta](https://github.com/USGS-WiM/StreamStats-National/releases/tag/v1.1.0-beta) - 2022-05-09

### Added

- Unit testing for general map 

### Changed

-   Contact email address

### Removed

-   Forests parameter from fire hydrology basin characteristics 

## [v1.0.0-beta](https://github.com/USGS-WiM/StreamStats-National/releases/tag/v1.0.0-beta) - 2022-04-20

### Added

-   Added streamgage layer
-   Basic app structure: top bar, left sidebar, right sidebar, map area, bottom section
-   Automated checks for pull requests
-   Added leaflet map
-   Updated site icon to WIM favicon
-   Added template components and initial hookups into basic app structure
-   Added example workflow
-   Added general map functions: scale, zoom, show your location, geosearch, basemap selection
-   Added google analytics
-   Added basin delineation workflow
-   Added fire hydrology workflows
-   Added trace functionality for query fire perimeters
-   Added functionality to query geology, burned area, precomputed basin characteristics, and fire hydrology streamflow estimates
-   Added toggleable layers
-   Added maps to report output
-   Added Beta release to title and About page
-   Added credits to libraries to About modal
-   Updated buttons to have accessible names

