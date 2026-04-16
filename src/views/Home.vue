<template>
  <div
    class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100"
  >
    <!-- Navigation (style app sombre) -->
    <nav
      class="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95 dark:shadow-none"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <img 
                src="/images/logo/logo.png" 
                alt="Rusa Travel" 
                class="w-16 h-16 object-contain"
              />
              <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">Rusa Travel</h1>
            </div>
          </div>
          
          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#accueil" class="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition">Accueil</a>
            <a href="#destinations" class="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition">Destinations</a>
            <a href="#search" class="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition">Rechercher</a>
            <a href="#about" class="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition">À propos</a>
            <a href="#contact" class="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition">Contact</a>
          </div>
          
          <!-- Desktop Auth Buttons -->
          <div class="hidden md:flex items-center gap-3 sm:gap-4">
            <ThemeToggler />
            <router-link
              to="/signin"
              class="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Connexion
            </router-link>
            <router-link
              to="/signup"
              class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition"
            >
              S'inscrire
            </router-link>
          </div>
          
          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center gap-2">
            <ThemeToggler />
            <!-- Mobile Hamburger Menu -->
            <button
              @click="toggleMobileNav"
              class="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition"
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
          class="md:hidden border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a href="#accueil" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition">Accueil</a>
            <a href="#destinations" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition">Destinations</a>
            <a href="#search" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition">Rechercher</a>
            <a href="#about" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition">À propos</a>
            <a href="#contact" @click="closeMobileNav" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition">Contact</a>
            
            <!-- Séparateur -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"></div>
            
            <!-- Boutons Connexion/Inscription -->
            <router-link
              to="/signin"
              @click="closeMobileNav"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition"
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
              class="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition"
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

    <!-- Hero — carrousel (fond aligné sur le thème sombre : gray-950, fondu bas → section suivante) -->
    <section
      ref="heroRef"
      id="accueil"
      class="relative min-h-[100dvh] overflow-hidden bg-gray-900 pb-3 text-white dark:bg-gray-950"
    >
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-56 bg-gradient-to-b from-transparent from-[28%] via-gray-950/25 via-[55%] to-gray-50 sm:h-64 sm:from-[22%] dark:via-gray-950/50 dark:via-[50%] dark:to-gray-900"
        aria-hidden="true"
      />
      <div
        class="hero-carousel-pagination pointer-events-auto absolute bottom-[4.5rem] left-0 right-0 z-20 flex items-center justify-center gap-2 sm:bottom-20"
        aria-hidden="true"
      />
      <Swiper
        class="home-hero-swiper home-hero-swiper--fade relative z-0 h-[calc(100dvh-1.25rem)] min-h-[calc(100dvh-1.25rem)] sm:h-[calc(100dvh-1.5rem)] sm:min-h-[calc(100dvh-1.5rem)]"
        :modules="swiperModules"
        effect="fade"
        :fade-effect="heroFadeEffect"
        :slides-per-view="1"
        :loop="homeHeroSlides.length > 1"
        :speed="1400"
        :autoplay="heroAutoplay"
        :touch-start-prevent-default="false"
        :pagination="{ el: '.hero-carousel-pagination', clickable: true }"
      >
        <SwiperSlide v-for="(slide, index) in homeHeroSlides" :key="index">
          <div class="relative h-full min-h-[calc(100dvh-1.25rem)] w-full overflow-hidden sm:min-h-[calc(100dvh-1.5rem)]">
            <div class="hero-slide-img pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <img
                :src="slide.image"
                :alt="
                  slide.title ||
                  (slide.titleLines ? slide.titleLines.join(' ') : 'Rusa Travel')
                "
                draggable="false"
                class="hero-slide-img__media pointer-events-none h-full w-full select-none object-cover"
                loading="eager"
              />
            </div>
            <div
              class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-gray-950/70 via-gray-950/45 to-gray-950/90"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none relative z-10 flex h-full min-h-[calc(100dvh-1.25rem)] w-full flex-col pt-16 sm:min-h-[calc(100dvh-1.5rem)] sm:pt-20"
            >
              <div
                class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-24 pt-24 text-center sm:px-10 sm:pb-28 sm:pt-28 md:pt-36"
              >
                <div class="pointer-events-auto w-full max-w-4xl">
                  <h2
                    v-if="slide.titleLines && slide.titleLines.length"
                    class="mx-auto w-full max-w-full text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl"
                  >
                    <span
                      class="inline-block max-w-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {{ slide.titleLines.join(' ') }}
                    </span>
                  </h2>
                  <h2
                    v-else-if="slide.title"
                    class="mx-auto w-full max-w-full text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl"
                  >
                    <span
                      class="inline-block max-w-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {{ slide.title }}
                    </span>
                  </h2>
                  <p
                    class="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-100/95 sm:mt-6 sm:text-xl md:text-2xl"
                  >
                    {{ slide.subtitle }}
                  </p>
                  <div
                    class="mt-8 flex flex-col items-stretch justify-center gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5"
                  >
                    <a
                      href="#search"
                      class="group relative inline-flex min-h-[3rem] items-center justify-center overflow-hidden rounded-full bg-primary-500 px-9 py-3.5 text-center text-base font-bold text-white shadow-xl drop-shadow-sm transition duration-300 hover:bg-primary-600 sm:min-h-0 sm:px-11 sm:py-4 sm:text-lg"
                    >
                      <span class="relative z-10">Réserver maintenant</span>
                    </a>
                    <router-link
                      to="/signin"
                      class="inline-flex min-h-[3rem] items-center justify-center rounded-full border-2 border-white px-9 py-3.5 text-center text-base font-bold text-white shadow-lg backdrop-blur-sm transition duration-300 hover:bg-white hover:text-gray-900 sm:min-h-0 sm:px-11 sm:py-4 sm:text-lg"
                    >
                      Connexion
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <div class="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 animate-bounce sm:bottom-3">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Recherche — carte type app (fond gray-900 en sombre, séparateurs pointillés) -->
    <section
      ref="searchRef"
      id="search"
      class="relative bg-gradient-to-b from-gray-100 to-white py-16 dark:from-gray-950 dark:to-gray-950 sm:py-20"
    >
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-10 text-center md:mb-12">
          <h3 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Commencez à rêver
          </h3>
          <p class="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-400">
            Aventure ou immersion culturelle ? Explorez le Congo avec
            <span class="font-semibold text-primary-600 dark:text-primary-400">Rusa Travel</span>
            — le meilleur de nos destinations.
          </p>
        </div>

        <div class="mx-auto max-w-5xl">
          <div
            class="home-app-card overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
          >
            <div class="border-b border-dashed border-gray-200 px-6 py-5 dark:border-gray-700 md:px-8">
              <p class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500">
                Recherche de trajet
              </p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">Où allez-vous ?</p>
            </div>
            <div class="grid grid-cols-1 items-end gap-6 p-6 md:grid-cols-12 md:gap-6 md:p-8">
              <div class="md:col-span-3">
                <label
                  class="mb-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <span
                    class="mr-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-400"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  Départ
                </label>
                <select
                  class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>Choisissez votre ville</option>
                  <option>Kinshasa</option>
                  <option>Lubumbashi</option>
                  <option>Goma</option>
                  <option>Kisangani</option>
                </select>
              </div>

              <div class="md:col-span-3">
                <label
                  class="mb-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <span
                    class="mr-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-400"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  Destination
                </label>
                <select
                  class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>Choisissez votre destination</option>
                  <option>Kinshasa</option>
                  <option>Lubumbashi</option>
                  <option>Goma</option>
                  <option>Kisangani</option>
                </select>
              </div>

              <div class="md:col-span-3">
                <label
                  class="mb-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <span
                    class="mr-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-400"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  Date
                </label>
                <input
                  type="date"
                  class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div class="md:col-span-3">
                <button
                  type="button"
                  class="group flex w-full items-center justify-center rounded-2xl bg-primary-500 px-6 py-4 text-sm font-bold text-gray-950 shadow-lg transition hover:bg-primary-600 dark:text-gray-950"
                >
                  <svg
                    class="mr-2 h-5 w-5 transition-transform group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Destinations — cartes type « prochains départs » (icône bus, badge, turquoise) -->
    <section
      ref="destinationsRef"
      id="destinations"
      class="border-t border-dashed border-gray-200 py-16 dark:border-gray-800 dark:bg-gray-950 sm:py-20"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-12 sm:flex-row sm:items-center">
          <div>
            <h3 class="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
              Destinations populaires
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
              Tarifs indicatifs et fréquences — style aligné sur l’app mobile Rusa Travel.
            </p>
          </div>
          <span
            class="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
          >
            <svg class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Carte
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <!-- Kinshasa -->
          <div
            class="destination-card group rounded-3xl border border-gray-200 bg-white shadow-md transition hover:border-primary-500/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/30"
          >
            <div
              class="flex items-center gap-4 border-b border-dashed border-gray-200 p-5 dark:border-gray-700"
            >
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-600 dark:text-primary-400"
              >
                <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 16c0 .88.39 1.67 1 2.2V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.8c.61-.53 1-1.32 1-2.2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V7h12v4z"
                  />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-bold text-gray-900 dark:text-white">Kinshasa</h4>
                <p class="truncate text-sm text-gray-500 dark:text-gray-400">Capitale • Bus VIP</p>
              </div>
              <span
                class="shrink-0 rounded-full border border-primary-500 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400"
              >
                Populaire
              </span>
            </div>
            <div class="space-y-4 p-5">
              <div class="flex items-end justify-between border-b border-dashed border-gray-200 pb-4 dark:border-gray-700">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">À partir de</p>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">50 000 FC</p>
                </div>
                <p class="text-right text-xs text-gray-500 dark:text-gray-400">12 départs / jour</p>
              </div>
              <button
                type="button"
                class="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary-500 hover:bg-primary-500/10 dark:border-gray-700 dark:text-white dark:hover:border-primary-500 dark:hover:bg-primary-500/10"
              >
                Voir les trajets
              </button>
            </div>
          </div>

          <!-- Lubumbashi -->
          <div
            class="destination-card group rounded-3xl border border-gray-200 bg-white shadow-md transition hover:border-primary-500/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/30"
          >
            <div
              class="flex items-center gap-4 border-b border-dashed border-gray-200 p-5 dark:border-gray-700"
            >
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-600 dark:text-primary-400"
              >
                <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 16c0 .88.39 1.67 1 2.2V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.8c.61-.53 1-1.32 1-2.2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V7h12v4z"
                  />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-bold text-gray-900 dark:text-white">Lubumbashi</h4>
                <p class="truncate text-sm text-gray-500 dark:text-gray-400">Sud • Bus confort</p>
              </div>
              <span
                class="shrink-0 rounded-full border border-amber-500/80 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400"
              >
                Actif
              </span>
            </div>
            <div class="space-y-4 p-5">
              <div class="flex items-end justify-between border-b border-dashed border-gray-200 pb-4 dark:border-gray-700">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">À partir de</p>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">170 000 FC</p>
                </div>
                <p class="text-right text-xs text-gray-500 dark:text-gray-400">6 départs / jour</p>
              </div>
              <button
                type="button"
                class="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary-500 hover:bg-primary-500/10 dark:border-gray-700 dark:text-white dark:hover:border-primary-500 dark:hover:bg-primary-500/10"
              >
                Voir les trajets
              </button>
            </div>
          </div>

          <!-- Goma -->
          <div
            class="destination-card group rounded-3xl border border-gray-200 bg-white shadow-md transition hover:border-primary-500/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/30"
          >
            <div
              class="flex items-center gap-4 border-b border-dashed border-gray-200 p-5 dark:border-gray-700"
            >
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-600 dark:text-primary-400"
              >
                <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 16c0 .88.39 1.67 1 2.2V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.8c.61-.53 1-1.32 1-2.2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V7h12v4z"
                  />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-bold text-gray-900 dark:text-white">Goma</h4>
                <p class="truncate text-sm text-gray-500 dark:text-gray-400">Est • Lac Kivu</p>
              </div>
              <span
                class="shrink-0 rounded-full border border-sky-500/80 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400"
              >
                Bientôt
              </span>
            </div>
            <div class="space-y-4 p-5">
              <div class="flex items-end justify-between border-b border-dashed border-gray-200 pb-4 dark:border-gray-700">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">À partir de</p>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">130 000 FC</p>
                </div>
                <p class="text-right text-xs text-gray-500 dark:text-gray-400">4 départs / jour</p>
              </div>
              <button
                type="button"
                class="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary-500 hover:bg-primary-500/10 dark:border-gray-700 dark:text-white dark:hover:border-primary-500 dark:hover:bg-primary-500/10"
              >
                Voir les trajets
              </button>
            </div>
          </div>

          <!-- Kisangani -->
          <div
            class="destination-card group rounded-3xl border border-gray-200 bg-white shadow-md transition hover:border-primary-500/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/30"
          >
            <div
              class="flex items-center gap-4 border-b border-dashed border-gray-200 p-5 dark:border-gray-700"
            >
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-600 dark:text-primary-400"
              >
                <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 16c0 .88.39 1.67 1 2.2V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.8c.61-.53 1-1.32 1-2.2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V7h12v4z"
                  />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-bold text-gray-900 dark:text-white">Kisangani</h4>
                <p class="truncate text-sm text-gray-500 dark:text-gray-400">Nord • Fleuve</p>
              </div>
              <span
                class="shrink-0 rounded-full border border-gray-400 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-400"
              >
                Stable
              </span>
            </div>
            <div class="space-y-4 p-5">
              <div class="flex items-end justify-between border-b border-dashed border-gray-200 pb-4 dark:border-gray-700">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">À partir de</p>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">110 000 FC</p>
                </div>
                <p class="text-right text-xs text-gray-500 dark:text-gray-400">5 départs / jour</p>
              </div>
              <button
                type="button"
                class="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition hover:border-primary-500 hover:bg-primary-500/10 dark:border-gray-700 dark:text-white dark:hover:border-primary-500 dark:hover:bg-primary-500/10"
              >
                Voir les trajets
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pourquoi nous — cartes type « méthode de paiement » -->
    <section
      ref="featuresRef"
      id="about"
      class="border-t border-dashed border-gray-200 py-16 dark:border-gray-800 dark:bg-gray-950 sm:py-20"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-10 text-center md:mb-12">
          <h3 class="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
            Pourquoi choisir Rusa Travel ?
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
            Votre partenaire pour tous vos trajets en RDC.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          <div
            class="feature-card rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-600 dark:text-primary-400"
            >
              <svg class="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h4 class="mb-2 text-lg font-bold text-gray-900 dark:text-white">Sécurité</h4>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Flotte moderne et chauffeurs expérimentés.
            </p>
          </div>

          <div
            class="feature-card rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-600 dark:text-primary-400"
            >
              <svg class="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 class="mb-2 text-lg font-bold text-gray-900 dark:text-white">Ponctualité</h4>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Horaires respectés et suivi en temps réel.
            </p>
          </div>

          <div
            class="feature-card rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-600 dark:text-primary-400"
            >
              <svg class="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h4 class="mb-2 text-lg font-bold text-gray-900 dark:text-white">Service client</h4>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Assistance 24/7 et support multilingue.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA — barre type confirmation paiement -->
    <section ref="ctaRef" class="border-t border-dashed border-gray-200 py-12 dark:border-gray-800 dark:bg-gray-950">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div
          class="home-app-card overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-none md:p-8"
        >
          <h3 class="text-center text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
            Prêt à voyager avec nous ?
          </h3>
          <p class="mx-auto mt-3 max-w-lg text-center text-sm text-gray-600 dark:text-gray-400">
            Rejoignez les voyageurs qui nous font confiance sur tout le territoire.
          </p>
          <div
            class="mt-8 flex flex-col gap-3 border-t border-dashed border-gray-200 pt-8 dark:border-gray-700 sm:flex-row sm:justify-center"
          >
            <a
              href="#search"
              class="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-8 py-3.5 text-center text-sm font-bold text-gray-950 transition hover:bg-primary-600 dark:text-gray-950"
            >
              Réserver maintenant
            </a>
            <router-link
              to="/signin"
              class="inline-flex items-center justify-center rounded-2xl border-2 border-gray-300 px-8 py-3.5 text-center text-sm font-bold text-gray-800 transition hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800/80"
            >
              Connexion
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Chiffres -->
    <section ref="statsRef" class="border-t border-dashed border-gray-200 py-14 dark:border-gray-800 dark:bg-gray-950">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid grid-cols-2 gap-4 rounded-3xl border border-gray-200 bg-white p-6 md:grid-cols-4 md:gap-6 md:p-8 dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="text-center">
            <p
              class="stat-number mb-1 text-3xl font-bold text-primary-600 md:text-4xl dark:text-primary-400"
              data-value="50000"
              data-suffix="K+"
            >
              0
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 md:text-sm">Voyageurs satisfaits</p>
          </div>
          <div class="text-center">
            <p
              class="stat-number mb-1 text-3xl font-bold text-primary-600 md:text-4xl dark:text-primary-400"
              data-value="100"
              data-suffix="+"
            >
              0
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 md:text-sm">Destinations</p>
          </div>
          <div class="text-center">
            <p
              class="stat-number mb-1 text-3xl font-bold text-primary-600 md:text-4xl dark:text-primary-400"
              data-value="24"
              data-suffix="/7"
            >
              0
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 md:text-sm">Assistance</p>
          </div>
          <div class="text-center">
            <p
              class="stat-number mb-1 text-3xl font-bold text-primary-600 md:text-4xl dark:text-primary-400"
              data-value="15"
              data-suffix="+"
            >
              0
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 md:text-sm">Années d'expérience</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="border-t border-gray-800 bg-gray-900 py-12 text-white dark:bg-gray-950">
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
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import ThemeToggler from '@/components/common/ThemeToggler.vue'
import { homeHeroSlides } from '@/config/homeHeroCarousel.js'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const swiperModules = [Pagination, Autoplay, EffectFade]

/** Autoplay : délai entre deux changements (après la fin de la transition). */
const heroAutoplay = {
  delay: 3200,
  disableOnInteraction: false,
  pauseOnMouseEnter: false,
  stopOnLastSlide: false,
}

const heroFadeEffect = { crossFade: true }

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

/* Hero — fondu + zoom lent sur l’image (Ken Burns inversé à l’activation) */
.home-hero-swiper--fade :deep(.swiper-slide) .hero-slide-img__media {
  transform: scale(1.1);
  transition: transform 1.85s cubic-bezier(0.33, 1, 0.68, 1);
  will-change: transform;
}

.home-hero-swiper--fade :deep(.swiper-slide-active) .hero-slide-img__media {
  transform: scale(1);
}

/* Hero carrousel — hauteur légèrement < 100dvh pour laisser voir le bas de section */
.home-hero-swiper :deep(.swiper-slide) {
  height: calc(100dvh - 1.25rem);
  min-height: calc(100dvh - 1.25rem);
}

@media (min-width: 640px) {
  .home-hero-swiper :deep(.swiper-slide) {
    height: calc(100dvh - 1.5rem);
    min-height: calc(100dvh - 1.5rem);
  }
}

.home-hero-swiper :deep(.swiper-wrapper) {
  min-height: calc(100dvh - 1.25rem);
}

@media (min-width: 640px) {
  .home-hero-swiper :deep(.swiper-wrapper) {
    min-height: calc(100dvh - 1.5rem);
  }
}

/* Hero carrousel — pastilles type maquette */
.hero-carousel-pagination :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  margin: 0 !important;
  border-radius: 9999px;
  background: #ffffff;
  opacity: 1;
  transition: width 0.25s ease, background-color 0.25s ease;
}

.hero-carousel-pagination :deep(.swiper-pagination-bullet-active) {
  width: 28px;
  border-radius: 9999px;
  background: var(--color-500);
}
</style>

