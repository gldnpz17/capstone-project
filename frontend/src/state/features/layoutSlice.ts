import { createSlice } from '@reduxjs/toolkit'

export interface LayoutState {
  sidebarCollapsed: boolean
}

const initState: LayoutState = {
  sidebarCollapsed: false
}

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: initState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    }
  }
})

export const { toggleSidebar } = layoutSlice.actions

export const layoutReducer = layoutSlice.reducer