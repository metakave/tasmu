angular.module('tasmuApp', [])
.controller('MainController', ['$scope', '$timeout', function($scope, $timeout) {
  // Navigation Menu State
  $scope.mobileMenuOpen = false;
  $scope.toggleMobileMenu = function() {
    $scope.mobileMenuOpen = !$scope.mobileMenuOpen;
  };

  // Hero Slider State
  $scope.currentSlide = 0;
  $scope.slides = [
    {
      title: "Smart Solutions for Qatar",
      subtitle: "Empowering a digital future for all citizens and residents through the TASMU Smart Qatar Program.",
      image: "assets/images/banner.jpg",
      cta: "Explore Our Sectors"
    },
    {
      title: "Transforming Five Key Sectors",
      subtitle: "Driving innovation across Transportation, Logistics, Healthcare, Environment, and Sports.",
      image: "assets/images/banner.jpg",
      cta: "View Interactive Map"
    }
  ];

  $scope.nextSlide = function() {
    $scope.currentSlide = ($scope.currentSlide + 1) % $scope.slides.length;
  };

  $scope.prevSlide = function() {
    $scope.currentSlide = ($scope.currentSlide - 1 + $scope.slides.length) % $scope.slides.length;
  };

  // Auto-play hero slider
  var slideTimer;
  function startSlideTimer() {
    slideTimer = $timeout(function() {
      $scope.nextSlide();
      startSlideTimer();
    }, 7000);
  }
  startSlideTimer();

  $scope.$on('$destroy', function() {
    if (slideTimer) $timeout.cancel(slideTimer);
  });

  // Priority Sectors Data
  $scope.sectors = [
    {
      id: 'transportation',
      name: 'Transportation',
      iconClass: 'transportation',
      tagline: 'Safe, seamless, and efficient journeys for all',
      capabilities: [
        'Public Transportation Kiosks',
        'Single Transport Pass',
        'Public Transportation Portal',
        'Public Transportation Control Center',
        'eBike Stations',
        'eCar Stations',
        'Integrated Response Team',
        'Autonomous Vehicle Fleet',
        'Geospatial Information System',
        'National Directory',
        'National Transportation Information Database',
        'Intelligent Road Sensing Network'
      ],
      themes: [
        {
          name: 'Searchable City',
          description: 'Provision of relevant city data at the right time to drive guidance and mobility insights.',
          useCases: [
            { name: 'Digital Travel Guide', desc: 'Real-time digital travel guide providing context-aware city navigation and schedule information.' },
            { name: 'Augmented City', desc: 'Overlaying digital guidance, signage, and tourist info onto the physical environment using AR.' },
            { name: 'Contextual Indoor Navigation', desc: 'Detailed, step-by-step indoor mapping for public spaces, transport hubs, and shopping malls.' }
          ]
        },
        {
          name: 'Seamless Mobility',
          description: 'Integration of transport modes for a unified and personalized traveler experience.',
          useCases: [
            { name: 'Smart Parking', desc: 'Instant reservation and navigation to available smart parking spots.' },
            { name: 'Connected Transport Network', desc: 'Synchronized timings across metros, buses, and autonomous taxis.' },
            { name: 'Single Transport Pass', desc: 'One account/ticket used dynamically across all public transportation.' },
            { name: 'On-Route Concierge', desc: 'Proactive digital guidance that adjusts during transit in case of delays.' }
          ]
        },
        {
          name: 'Universal Access',
          description: 'Development of mobility services which are inclusive and accessible to all demographics.',
          useCases: [
            { name: 'Natural Language Interaction', desc: 'Interact with transport services using direct voice and natural language AI.' },
            { name: 'Instant Signage Translation', desc: 'Real-time camera-based signage translation for tourists.' },
            { name: 'Accessible Transportation', desc: 'Dynamic routing and assistance specifically tailored for people with limited mobility.' }
          ]
        },
        {
          name: 'Safe Journey',
          description: 'Ensuring the safety and risk management across the transport ecosystem.',
          useCases: [
            { name: 'Intelligent Road Side Assistance', desc: 'Automated notification and dispatch of road assistance upon breakdown detection.' },
            { name: 'Connected Vehicle (V2V)', desc: 'Vehicle-to-vehicle wireless communication to avoid collisions and coordinate lane changes.' },
            { name: 'Intelligent Road Signage', desc: 'Digital signage that adapts based on actual weather, traffic, and speed parameters.' }
          ]
        }
      ]
    },
    {
      id: 'logistics',
      name: 'Logistics',
      iconClass: 'logistics',
      tagline: 'Driving commercial efficiency and last-mile agility',
      capabilities: [
        'National Logistics Portal',
        'Supply Chain Control Center',
        'National Addressing System',
        'Track and Trace',
        'Intermodal Network Database',
        'Supply Inventory Database',
        'Geospatial Information System',
        'National Directory',
        'Intelligent Facility Infrastructure',
        'Intelligent Road Sensing Network'
      ],
      themes: [
        {
          name: 'Connected Logistics',
          description: 'Effective logistics management and decision making delivered through consolidated digital channels.',
          useCases: [
            { name: 'National Supply and Demand Dashboard', desc: 'Visual monitoring of primary national assets and product flows.' },
            { name: 'National Warehousing Marketplace', desc: 'P2P platform to lease, rent, or trade storage and warehouse facilities.' },
            { name: 'Digital Shipping Guide', desc: 'Automated guidance on routes, custom charges, and schedules.' }
          ]
        },
        {
          name: 'Digital Workplace',
          description: 'Improved port productivity through automated container handling and augmented field workforce.',
          useCases: [
            { name: 'Augmented Workforce', desc: 'Warehouse and port personnel equipped with AR glasses showing pick-lists and routes.' },
            { name: 'Connected Warehouse', desc: 'Real-time telemetry and robotics optimization inside regional distribution centers.' }
          ]
        },
        {
          name: 'Dynamic Delivery',
          description: 'Extended last-mile delivery network for seamless and reliable goods transfer and delivery.',
          useCases: [
            { name: 'Automated Cargo Flow', desc: 'Automated tracking and routing of incoming shipments.' },
            { name: 'Drone Delivery', desc: 'Autonomous drone flight routes for fast delivery of light cargo/medicines.' },
            { name: 'Smart Dispatch', desc: 'AI-driven route planning and dynamic allocation of deliveries to nearby couriers.' }
          ]
        },
        {
          name: 'Empowered Recipients',
          description: 'Customer-centric and flexible services providing recipients control of their shipments.',
          useCases: [
            { name: 'Container eBooking', desc: 'Simple online portal to secure container bookings.' },
            { name: 'Smart Lockers', desc: 'Secure temperature-controlled community pickup points.' },
            { name: 'Flexible Delivery', desc: 'Allow customers to redirect packages in real-time mid-transit.' }
          ]
        }
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      iconClass: 'healthcare',
      tagline: 'Accessible medical care and proactive health management',
      capabilities: [
        'Healthcare Portal',
        'Digital Care Doctor Ecosystem',
        'National Health Calendar',
        'Smart Health Booth Network',
        'Integrated Response Team',
        'Mobile Clinic Fleet',
        'Single Patient Record Database',
        'National Diagnostic Database',
        'National Directory',
        'Geospatial Information System',
        'Health Information Exchange Network',
        'Intelligent Facility Infrastructure'
      ],
      themes: [
        {
          name: 'Healthcare On-Demand',
          description: 'Ubiquitous and instant access to health resources and recommendations.',
          useCases: [
            { name: 'Doctor Finder', desc: 'Easily query, filter, and review certified doctors and specialists in Qatar.' },
            { name: 'Health Calendar', desc: 'One centralized calendar to sync all health checks and doctor visits.' },
            { name: 'Virtual Consultation', desc: 'High-definition tele-health consulting with primary care providers.' }
          ]
        },
        {
          name: 'Extended Care',
          description: 'Provisioning and access to care outside clinics and hospitals.',
          useCases: [
            { name: 'Mobile Clinic', desc: 'Equipped vans providing direct health screenings in distant areas.' },
            { name: 'Smart Health Booth', desc: 'Automated physical health kiosk providing vital checkups in public spots.' },
            { name: 'Smart Ambulance', desc: 'High-speed medical telemetry streaming live patient data to hospitals during transport.' }
          ]
        },
        {
          name: 'Seamless Hospital',
          description: 'Integrated and collaborative systems for frictionless patient flows.',
          useCases: [
            { name: 'Single Patient Record', desc: 'A secure, national database of patients\' clinical history accessible by all clinics.' },
            { name: 'Augmented Caregivers', desc: 'Clinical assistants with instant access to patient records and drug interaction checker.' }
          ]
        },
        {
          name: 'Connected Wellness',
          description: 'Proactive and personalized health and wellness management.',
          useCases: [
            { name: 'Smart Medication', desc: 'Smart pill containers sending reminders to patients and caregiver dashboards.' },
            { name: 'Digital Health Coach', desc: 'Personalized wellness program guiding diets and physical workouts.' },
            { name: 'Remote Patient Monitoring', desc: 'Wearable tech streaming blood pressure/glucose readings directly to physicians.' }
          ]
        }
      ]
    },
    {
      id: 'environment',
      name: 'Environment',
      iconClass: 'environment',
      tagline: 'Sustainable resources, green living, and smart agriculture',
      capabilities: [
        'Farmer Community Portal',
        'Sustainability Control Center',
        'Autonomous Robot Farmers',
        'Recycling Services',
        'Smart Grid',
        'Geospatial Information System',
        'Supply Inventory Database',
        'National Environmental Database',
        'Environment Sensing Infrastructure',
        'Smart Water Network',
        'Renewable Energy Infrastructure',
        'Intelligent Facility Infrastructure'
      ],
      themes: [
        {
          name: 'Sustainable Resources',
          description: 'An environmentally-aware society, running on efficient operations with the ability to plan ahead.',
          useCases: [
            { name: 'National Food Security Analytics', desc: 'Tracking and predicting grain, meat, and water reserves in Qatar.' },
            { name: 'City Pollution Watch', desc: 'Sensors tracking air quality index (AQI) and notifying citizens.' },
            { name: 'Smart Water Network', desc: 'Detecting pipeline leaks using pressure-sensitive IoT devices.' }
          ]
        },
        {
          name: 'Digital Urbanization',
          description: 'Urban infrastructure designed with sustainability at the core.',
          useCases: [
            { name: 'Smart Buildings', desc: 'Automated HVAC and light scheduling to cut energy waste.' },
            { name: 'Intelligent Urban Lighting', desc: 'Street lights that dim automatically when roads are empty.' },
            { name: 'Solar Corniche', desc: 'Solar canopy pathways powering nearby public charging stations.' }
          ]
        },
        {
          name: 'Environmental Stewardship',
          description: 'Embedded sustainable practices and environmental protection into citizens’ daily life.',
          useCases: [
            { name: 'Recycling Coins', desc: 'Token incentives for disposing plastic/aluminum correctly at smart bins.' },
            { name: 'Zero Food Waste Platform', desc: 'Connecting restaurants to food banks to redistribute leftover fresh food.' }
          ]
        },
        {
          name: 'Connected Farming',
          description: 'Development of the farming community and empowering farmers with digital tools.',
          useCases: [
            { name: 'Precision Agriculture', desc: 'Drones and ground sensors monitoring soil hydration and nutrient levels.' },
            { name: 'Vertical Farming', desc: 'High-output hydroponic farms inside temperature-controlled spaces.' }
          ]
        }
      ]
    },
    {
      id: 'sports',
      name: 'Sports',
      iconClass: 'sports',
      tagline: 'Active lifestyle, elite athletics, and legendary fan experiences',
      capabilities: [
        'Fan Experience Platform',
        'Sports Portal',
        'Outdoor Interactive Event Signage',
        'Sporting Event Control Center',
        'National Event Planning Engine',
        'Integrated Response Team',
        'National Athlete Database',
        'Single Patient Record Database',
        'National Directory',
        'Geospatial Information System',
        'Sports IoT Infrastructure',
        'Intelligent Facility Infrastructure'
      ],
      themes: [
        {
          name: 'Active Nation',
          description: 'A competitive and accessible amateur and enthusiast sports community across the general population.',
          useCases: [
            { name: 'Active Lifestyle Social Dashboard', desc: 'Gamified app linking citizens in friendly physical workout challenges.' },
            { name: 'National Sports eHub', desc: 'Book courts, fields, and pools anywhere in the country with ease.' },
            { name: 'Game Finder', desc: 'Connect local players for amateur football, basketball, and tennis games.' }
          ]
        },
        {
          name: 'Competitive Athletes',
          description: 'Evolution of athlete performance through more effective and personalized training and fitness management.',
          useCases: [
            { name: 'Professional Athletes Performance Dashboard', desc: 'Advanced biomechanics analytics for national sport academy candidates.' },
            { name: 'Technology Enhanced Training', desc: 'VR systems mimicking high-pressure stadium situations.' }
          ]
        },
        {
          name: 'Connected Fans',
          description: 'Provision of a personalized, homogeneous, and memorable sports fan journey.',
          useCases: [
            { name: 'Event Visit Planner Application', desc: 'Plan travel, parking, food, and ticketing for tournament games in one app.' },
            { name: 'Digital Fan Pass', desc: 'Paperless smart card for stadium gates, public transit, and concessions.' }
          ]
        },
        {
          name: 'Augmented Game Experience',
          description: 'Reinvention of the live game experience through immersive spectator interactions.',
          useCases: [
            { name: 'Sports Event Second Screen', desc: 'Interactive app showing live player stats, highlights, and cameras.' },
            { name: 'Stadium Fast Track', desc: 'Dynamic crowds and smart lines steering spectators to shorter queues.' }
          ]
        }
      ]
    }
  ];

  // Active Sector / Theme Selector
  $scope.activeSector = $scope.sectors[0];
  $scope.activeTheme = $scope.activeSector.themes[0];

  $scope.selectSector = function(sector) {
    $scope.activeSector = sector;
    $scope.activeTheme = sector.themes[0];
    $scope.activeUseCase = null;
  };

  $scope.selectTheme = function(theme) {
    $scope.activeTheme = theme;
    $scope.activeUseCase = null;
  };

  // Detailed Modal/Detail view for Use Case
  $scope.activeUseCase = null;
  $scope.showUseCaseDetails = function(useCase) {
    $scope.activeUseCase = useCase;
  };
  $scope.closeUseCaseDetails = function() {
    $scope.activeUseCase = null;
  };

  // Capabilities modal
  $scope.showCapabilities = false;
  $scope.toggleCapabilities = function() {
    $scope.showCapabilities = !$scope.showCapabilities;
  };
}]);
