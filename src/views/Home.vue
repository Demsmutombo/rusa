<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 border-b border-primary-100 bg-white/95 shadow-md backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <img 
                src="/images/logo/logo.png" 
                alt="Rusa Travel" 
                class="w-16 h-16 object-contain"
              />
              <h1 class="text-2xl font-bold text-primary-600">Rusa Travel</h1>
            </div>
          </div>
          
          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#accueil" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition">Accueil</a>
            <a href="#destinations" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition">Destinations</a>
            <a href="#search" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition">Rechercher</a>
            <a href="#about" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition">À propos</a>
            <a href="#contact" class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition">Contact</a>
          </div>
          
          <!-- Desktop Auth Buttons -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link
              to="/signin"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Connexion
            </router-link>
            <router-link
              to="/signup"
              class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
            >
              S'inscrire
            </router-link>
          </div>
          
          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center">
            <!-- Mobile Hamburger Menu -->
            <button
              @click="toggleMobileNav"
              class="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Mobile Navigation Menu -->
        <div 
          v-if="mobileNavOpen"
          class="md:hidden bg-white border-t border-gray-200"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a href="#accueil" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition">Accueil</a>
            <a href="#destinations" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition">Destinations</a>
            <a href="#search" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition">Rechercher</a>
            <a href="#about" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition">À propos</a>
            <a href="#contact" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition">Contact</a>
            
            <!-- Séparateur -->
            <div class="border-t border-gray-200 pt-2 mt-2"></div>
            
            <!-- Boutons Connexion/Inscription -->
            <router-link
              to="/signin"
              @click="closeMobileNav"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Connexion</span>
              </div>
            </router-link>
            <router-link
              to="/signup"
              @click="closeMobileNav"
              class="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>S'inscrire</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section ref="heroRef" id="accueil" class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background avec gradient moderne -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400">
        <div class="absolute inset-0 bg-black/20"></div>
      </div>
      
      <!-- Particules animées -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse parallax" data-speed="0.3"></div>
        <div class="absolute top-40 right-10 w-96 h-96 bg-primary-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000 parallax" data-speed="0.4"></div>
        <div class="absolute bottom-20 left-1/2 w-80 h-80 bg-brand-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000 parallax" data-speed="0.2"></div>
      </div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div class="animate-fade-in-up">
          <h2 class="text-6xl md:text-7xl font-bold mb-6">
            Transport de voyage
          </h2>
          <p class="text-2xl md:text-3xl mb-6 max-w-4xl mx-auto font-light">
            Voyagez en toute sécurité avec <span class="font-bold text-primary-50">Rusa Travel</span>
          </p>
          <p class="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-primary-50">
            La plateforme de transport la plus fiable de la République Démocratique du Congo
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-6">
            <button class="group relative px-10 py-4 bg-white text-brand-500 rounded-full font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-2xl">
              <span class="relative z-10 transition-colors duration-300 group-hover:text-white">Réserver maintenant</span>
              <div class="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <router-link
              to="/signin"
              class="group px-10 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-brand-500 transform hover:scale-105 transition-all duration-300"
            >
              Connexion
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Search Section -->
    <section ref="searchRef" id="search" class="py-20 bg-gradient-to-b from-gray-50 to-white relative">
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h3 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Commencez à rêver
          </h3>
          <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Aventure ou immersion culturelle ? Explorer les villes vibrantes du Congo ou les paysages spectaculaires ? 
            <span class="font-semibold text-primary-600">Rusa Travel</span> a sélectionné le meilleur de ce que nos destinations ont à offrir.
          </p>
        </div>

        <div class="max-w-5xl mx-auto">
          <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div class="md:col-span-3">
                <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Départ
                </label>
                <select class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-gray-700 font-medium">
                  <option>Choisissez votre ville</option>
                  <option>Kinshasa</option>
                  <option>Lubumbashi</option>
                  <option>Goma</option>
                  <option>Kisangani</option>
                </select>
              </div>
              
              <div class="md:col-span-3">
                <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Destination
                </label>
                <select class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-gray-700 font-medium">
                  <option>Choisissez votre destination</option>
                  <option>Kinshasa</option>
                  <option>Lubumbashi</option>
                  <option>Goma</option>
                  <option>Kisangani</option>
                </select>
              </div>
              
              <div class="md:col-span-3">
                <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date
                </label>
                <input
                  type="date"
                  class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-gray-700 font-medium"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              
              <div class="md:col-span-3">
                <button type="button" class="group flex w-full transform items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-500),var(--color-800))] px-8 py-4 font-bold text-white shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl">
                  <svg class="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher votre trajet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Destinations -->
    <section ref="destinationsRef" id="destinations" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h3 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-primary-800">
            Destinations Populaires
          </h3>
          <p class="text-xl text-gray-600 max-w-4xl mx-auto">
            Découvrez nos destinations les plus prisées et commencez à planifier votre prochaine aventure
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Kinshasa -->
          <div class="destination-card group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div class="absolute top-4 right-4 z-10">
              <span class="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">POPULAIRE</span>
            </div>
            <div class="h-56 bg-gradient-to-br from-primary-500 to-primary-800 relative overflow-hidden">
              <div class="absolute inset-0 bg-black opacity-20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h4 class="text-2xl font-bold mb-1">Kinshasa</h4>
                  <p class="text-sm opacity-90">Capitale vibrante</p>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm text-gray-500 mb-1">À partir de</p>
                  <p class="text-3xl font-bold text-primary-600">50,000 FC</p>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-gray-600 mb-1">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm">12 départs/jour</span>
                  </div>
                </div>
              </div>
              <button class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                Voir les trajets
              </button>
            </div>
          </div>

          <!-- Lubumbashi -->
          <div class="destination-card group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-56 bg-gradient-to-br from-green-500 to-green-700 relative overflow-hidden">
              <div class="absolute inset-0 bg-black opacity-20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h4 class="text-2xl font-bold mb-1">Lubumbashi</h4>
                  <p class="text-sm opacity-90">Capitale minière</p>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm text-gray-500 mb-1">À partir de</p>
                  <p class="text-3xl font-bold text-primary-600">170,000 FC</p>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-gray-600 mb-1">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm">6 départs/jour</span>
                  </div>
                </div>
              </div>
              <button class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                Voir les trajets
              </button>
            </div>
          </div>

          <!-- Goma -->
          <div class="destination-card group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-56 bg-gradient-to-br from-purple-500 to-purple-700 relative overflow-hidden">
              <div class="absolute inset-0 bg-black opacity-20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h4 class="text-2xl font-bold mb-1">Goma</h4>
                  <p class="text-sm opacity-90">Ville lacustre</p>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm text-gray-500 mb-1">À partir de</p>
                  <p class="text-3xl font-bold text-primary-600">130,000 FC</p>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-gray-600 mb-1">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm">4 départs/jour</span>
                  </div>
                </div>
              </div>
              <button class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                Voir les trajets
              </button>
            </div>
          </div>

          <!-- Kisangani -->
          <div class="destination-card group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-56 bg-gradient-to-br from-orange-500 to-orange-700 relative overflow-hidden">
              <div class="absolute inset-0 bg-black opacity-20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h4 class="text-2xl font-bold mb-1">Kisangani</h4>
                  <p class="text-sm opacity-90">Cité de Stanley</p>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm text-gray-500 mb-1">À partir de</p>
                  <p class="text-3xl font-bold text-primary-600">110,000 FC</p>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-gray-600 mb-1">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm">5 départs/jour</span>
                  </div>
                </div>
              </div>
              <button class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                Voir les trajets
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section ref="featuresRef" id="about" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h3 class="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Rusa Travel?</h3>
          <p class="text-lg text-gray-600">Votre partenaire de confiance pour tous vos voyages en République Démocratique du Congo</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Security -->
          <div class="feature-card text-center">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-gray-900 mb-2">Sécurité</h4>
            <p class="text-gray-600">Voyagez en toute tranquillité avec nos véhicules modernes et nos chauffeurs expérimentés</p>
          </div>

          <!-- Punctuality -->
          <div class="feature-card text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-gray-900 mb-2">Ponctualité</h4>
            <p class="text-gray-600">Respect des horaires garantis avec un suivi en temps réel de vos trajets</p>
          </div>

          <!-- Customer Service -->
          <div class="feature-card text-center">
            <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 36h12m-6 6v-6m-2 18h12M12 6h.01M12 12h.01M12 18h.01" />
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-gray-900 mb-2">Service Client</h4>
            <p class="text-gray-600">Assistance 24/7 et support multilingue pour accompagner votre voyage</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section ref="ctaRef" class="py-16 bg-primary-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 class="text-3xl font-bold mb-4">Prêt à voyager avec nous?</h3>
        <p class="text-xl mb-8">Rejoignez des milliers de voyageurs qui nous font confiance pour leurs déplacements en toute sécurité à travers la République Démocratique du Congo</p>
        
        <div class="flex justify-center space-x-4">
          <button class="bg-white text-primary-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Réserver maintenant
          </button>
          <router-link
            to="/signin"
            class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
          >
            Connexion
          </router-link>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section ref="statsRef" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="stat-number text-4xl font-bold text-primary-600 mb-2" data-value="50000" data-suffix="K+">0</p>
            <p class="text-gray-600">Voyageurs satisfaits</p>
          </div>
          <div>
            <p class="stat-number text-4xl font-bold text-primary-600 mb-2" data-value="100" data-suffix="+">0</p>
            <p class="text-gray-600">Destinations</p>
          </div>
          <div>
            <p class="stat-number text-4xl font-bold text-primary-600 mb-2" data-value="24" data-suffix="/7">0</p>
            <p class="text-gray-600">Assistance</p>
          </div>
          <div>
            <p class="stat-number text-4xl font-bold text-primary-600 mb-2" data-value="15" data-suffix="+">0</p>
            <p class="text-gray-600">Années d'expérience</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <img 
                src="/images/logo/logo.png" 
                alt="Rusa Travel" 
                class="w-20 h-20 object-contain"
              />
              <h3 class="text-2xl font-bold">Rusa Travel</h3>
            </div>
            <p class="text-gray-400 mb-4">Votre voyage, notre expertise</p>
            <p class="text-gray-400">La plateforme de transport la plus fiable de la République Démocratique du Congo. Voyagez en toute sécurité avec notre flotte moderne et nos chauffeurs professionnels.</p>
          </div>

          <!-- Navigation -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Navigation</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#accueil" class="hover:text-white transition">À propos</a></li>
              <li><a href="#destinations" class="hover:text-white transition">Destinations</a></li>
              <li><a href="#" class="hover:text-white transition">Tarifs</a></li>
              <li><a href="#contact" class="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <!-- Services -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Services</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">Transport passagers</a></li>
              <li><a href="#" class="hover:text-white transition">Transport marchandises</a></li>
              <li><a href="#" class="hover:text-white transition">Services entreprises</a></li>
              <li><a href="#" class="hover:text-white transition">Assistance 24/7</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Contact</h4>
            <div class="space-y-3 text-gray-400">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+243 123 456 789</span>
                <span class="ml-2 text-sm">(Disponible 24/7)</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@rusatravel.cd</span>
                <span class="ml-2 text-sm">(Réponse sous 2h)</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Kinshasa, RDC</span>
                <span class="ml-2 text-sm">(Avenue des Aviateurs)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Rusa Travel. Tous droits réservés.</p>
          <div class="mt-4 space-x-4">
            <a href="#" class="hover:text-white transition">Mentions légales</a>
            <a href="#" class="hover:text-white transition">Confidentialité</a>
            <a href="#" class="hover:text-white transition">Conditions d'utilisation</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup >
import { ref, onMounted, onUnmounted } from 'vue'

// Références pour les éléments à animer
const heroRef = ref(null)
const searchRef = ref(null)
const destinationsRef = ref(null)
const featuresRef = ref(null)
const ctaRef = ref(null)
const statsRef = ref(null)

// Configuration de l'Intersection Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

// Animation d'entrée pour les éléments
const animateOnScroll = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target 
      const animationType = element.getAttribute('data-animation') || 'fadeInUp'
      const delay = element.getAttribute('data-delay') || '0'
      
      element.style.opacity = '0'
      element.style.transform = 'translateY(30px)'
      element.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`
      
      // Forcer le reflow pour appliquer les styles initiaux
      void element.offsetHeight
      
      // Appliquer l'animation
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
      
      // Ajouter des animations spécifiques selon le type
      if (animationType === 'fadeInLeft') {
        element.style.transform = 'translateX(-50px)'
        setTimeout(() => {
          element.style.transform = 'translateX(0)'
        }, parseInt(delay) * 1000)
      } else if (animationType === 'fadeInRight') {
        element.style.transform = 'translateX(50px)'
        setTimeout(() => {
          element.style.transform = 'translateX(0)'
        }, parseInt(delay) * 1000)
      } else if (animationType === 'scaleIn') {
        element.style.transform = 'scale(0.8)'
        setTimeout(() => {
          element.style.transform = 'scale(1)'
        }, parseInt(delay) * 1000)
      }
      
      observer.unobserve(element)
    }
  })
}

// Créer l'observer
const observer = new IntersectionObserver(animateOnScroll, observerOptions)

onMounted(() => {
  // Observer chaque section avec des animations différentes
  setTimeout(() => {
    if (heroRef.value) {
      heroRef.value.classList.add('animate-hero')
    }
  }, 100)

  if (searchRef.value) {
    searchRef.value.setAttribute('data-animation', 'fadeInUp')
    searchRef.value.setAttribute('data-delay', '200')
    observer.observe(searchRef.value)
  }

  if (destinationsRef.value) {
    // Animer le titre
    const title = destinationsRef.value.querySelector('h3')
    if (title) {
      title.setAttribute('data-animation', 'fadeInUp')
      title.setAttribute('data-delay', '0')
      observer.observe(title)
    }
  }

  if (featuresRef.value) {
    const featureCards = featuresRef.value.querySelectorAll('.feature-card')
    featureCards.forEach((card, index) => {
      const cardElement = card 
      cardElement.setAttribute('data-animation', 'fadeInUp')
      cardElement.setAttribute('data-delay', (index * 150).toString())
      observer.observe(cardElement)
    })
  }

  if (ctaRef.value) {
    ctaRef.value.setAttribute('data-animation', 'fadeInUp')
    ctaRef.value.setAttribute('data-delay', '0')
    observer.observe(ctaRef.value)
  }

  if (statsRef.value) {
    // Animer les statistiques avec comptage
    const statNumbers = statsRef.value.querySelectorAll('.stat-number')
    statNumbers.forEach((stat, index) => {
      const element = stat 
      const finalValue = parseInt(element.getAttribute('data-value') || '0')
      let currentValue = 0
      const increment = finalValue / 50
      const duration = 2000
      const stepTime = duration / 50

      element.setAttribute('data-animation', 'fadeInUp')
      element.setAttribute('data-delay', (index * 100).toString())
      observer.observe(element)

      // Animation de comptage
      setTimeout(() => {
        const timer = setInterval(() => {
          currentValue += increment
          if (currentValue >= finalValue) {
            currentValue = finalValue
            clearInterval(timer)
          }
          element.textContent = Math.floor(currentValue).toString() + (element.getAttribute('data-suffix') || '')
        }, stepTime)
      }, (index * 100 + 800))
    })
  }

  // Ajouter les écouteurs d'événements pour le scroll et les menus mobiles
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

// Animation au scroll pour la navigation
const handleScroll = () => {
  const scrolled = window.pageYOffset
  const parallaxElements = document.querySelectorAll('.parallax')
  
  parallaxElements.forEach((element) => {
    const htmlElement = element 
    const speed = htmlElement.getAttribute('data-speed') || '0.5'
    const yPos = -(scrolled * parseFloat(speed))
    htmlElement.style.transform = `translateY(${yPos}px)`
  })
}

// Gestion des menus mobiles
const mobileMenuOpen = ref(false)
const mobileNavOpen = ref(false)
const mobileMenuRef = ref(null)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value
}

const closeMobileNav = () => {
  mobileNavOpen.value = false
}

// Fermer les menus quand on clique ailleurs
const handleClickOutside = (event) => {
  if (mobileMenuRef.value && !mobileMenuRef.value.contains(event.target )) {
    closeMobileMenu()
  }
}

// Nettoyage des écouteurs d'événements
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Couleurs personnalisées Rusa Travel */
:root {
  --color-brand-50: #ecf3ff;
  --color-brand-100: #dde9ff;
  --color-brand-300: #9cb9ff;
  --color-brand-400: #7592ff;
  --color-brand-500: #465fff;
  --color-brand-600: #3641f5;
  --color-brand-800: #252dae;
  --color-blue-light-50: #f0f9ff;
  --color-blue-light-500: #0ba5ec;
  --color-gray-dark: #1a2231;
}

/* Animations personnalisées */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Delays for staggered animations */
.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Custom transitions */
.transition {
  transition: 0.3s ease;
}

/* Glassmorphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #465fff 0%, #3641f5 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #3641f5 0%, #252dae 100%);
}
</style>

