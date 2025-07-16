export default {
  namespaced: true,
  state: {
    // Historical data filters
    historicalFilters: {
      location: 'Delhi',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    },
    
    // Table filters
    tableFilters: {
      location: '',
      dateRange: '',
      temperature: '',
      humidity: ''
    },
    
    // Pagination
    pagination: {
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0
    },
    
    // UI state
    sidebarOpen: false,
    mobileMenuOpen: false,
    showFilters: false,
    showDatePicker: false
  },
  mutations: {
    SET_HISTORICAL_FILTERS(state, filters) {
      state.historicalFilters = { ...state.historicalFilters, ...filters }
    },
    SET_TABLE_FILTERS(state, filters) {
      state.tableFilters = { ...state.tableFilters, ...filters }
    },
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination }
    },
    SET_SIDEBAR_OPEN(state, open) {
      state.sidebarOpen = open
    },
    SET_MOBILE_MENU_OPEN(state, open) {
      state.mobileMenuOpen = open
    },
    SET_SHOW_FILTERS(state, show) {
      state.showFilters = show
    },
    SET_SHOW_DATE_PICKER(state, show) {
      state.showDatePicker = show
    },
    RESET_FILTERS(state) {
      state.historicalFilters = {
        location: 'Delhi',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20
      }
      state.tableFilters = {
        location: '',
        dateRange: '',
        temperature: '',
        humidity: ''
      }
    },
    RESET_PAGINATION(state) {
      state.pagination = {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0
      }
    }
  },
  actions: {
    updateHistoricalFilters({ commit }, filters) {
      commit('SET_HISTORICAL_FILTERS', filters)
    },
    
    updateTableFilters({ commit }, filters) {
      commit('SET_TABLE_FILTERS', filters)
    },
    
    updatePagination({ commit }, pagination) {
      commit('SET_PAGINATION', pagination)
    },
    
    toggleSidebar({ commit, state }) {
      commit('SET_SIDEBAR_OPEN', !state.sidebarOpen)
    },
    
    toggleMobileMenu({ commit, state }) {
      commit('SET_MOBILE_MENU_OPEN', !state.mobileMenuOpen)
    },
    
    toggleFilters({ commit, state }) {
      commit('SET_SHOW_FILTERS', !state.showFilters)
    },
    
    toggleDatePicker({ commit, state }) {
      commit('SET_SHOW_DATE_PICKER', !state.showDatePicker)
    },
    
    resetFilters({ commit }) {
      commit('RESET_FILTERS')
    },
    
    resetPagination({ commit }) {
      commit('RESET_PAGINATION')
    },
    
    setLocation({ commit }, location) {
      commit('SET_HISTORICAL_FILTERS', { location })
      commit('SET_TABLE_FILTERS', { location })
    },
    
    setDateRange({ commit }, { startDate, endDate }) {
      commit('SET_HISTORICAL_FILTERS', { startDate, endDate })
    }
  },
  getters: {
    historicalFilters: state => state.historicalFilters,
    tableFilters: state => state.tableFilters,
    pagination: state => state.pagination,
    sidebarOpen: state => state.sidebarOpen,
    mobileMenuOpen: state => state.mobileMenuOpen,
    showFilters: state => state.showFilters,
    showDatePicker: state => state.showDatePicker,
    
    // Computed getters
    hasActiveFilters: state => {
      const { location, dateRange, temperature, humidity } = state.tableFilters
      return location || dateRange || temperature || humidity
    },
    
    isDateRangeValid: state => {
      const { startDate, endDate } = state.historicalFilters
      if (!startDate || !endDate) return false
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      const now = new Date()
      
      // Check if dates are in the past
      if (start > now || end > now) return false
      
      // Check if start date is before end date
      if (start >= end) return false
      
      // Check if date range is within 30 days
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24)
      if (daysDiff > 30) return false
      
      return true
    },
    
    formattedDateRange: state => {
      const { startDate, endDate } = state.historicalFilters
      if (!startDate || !endDate) return ''
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    }
  }
} 