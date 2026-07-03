/**
 * Centralized API Base URL configuration for the ARCUS platform.
 * Delegates to the environment variable VITE_API_BASE, or defaults to '/api' for proxying.
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
