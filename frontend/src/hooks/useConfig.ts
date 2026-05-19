'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

// ============= TYPES =============
export interface Tag {
    id: string;
    nameEn: string;
    namePl: string;
    categories: string[];
}

export interface Specialization {
    id: string;
    nameEn: string;
    namePl: string;
    icon: string;
    order: number;
}

export interface Goal {
    id: string;
    icon: string;
    nameEn: string;
    namePl: string;
}

// ============= CACHE =============
let tagsCache: Tag[] | null = null;
let specializationsCache: Specialization[] | null = null;
let goalsCache: Goal[] | null = null;

// In-flight promise cache to prevent duplicate fetches
let tagsPromise: Promise<Tag[]> | null = null;
let specializationsPromise: Promise<Specialization[]> | null = null;
let goalsPromise: Promise<Goal[]> | null = null;

function fetchTags(): Promise<Tag[]> {
    if (tagsCache) {
        return Promise.resolve(tagsCache);
    }
    
    if (tagsPromise) {
        return tagsPromise;
    }

    tagsPromise = apiClient.get<Tag[]>('/config/tags')
        .then((res) => res.data)
        .then((data: Tag[]) => {
            tagsCache = data;
            tagsPromise = null;
            return data;
        })
        .catch((err) => {
            tagsPromise = null;
            throw err;
        });

    return tagsPromise;
}

export function useTags() {
    const [tags, setTags] = useState<Tag[]>(tagsCache || []);
    const [loading, setLoading] = useState(!tagsCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tagsCache) {
            return;
        }

        fetchTags()
            .then((data) => {
                setTags(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { tags, loading, error };
}

function fetchSpecializations(): Promise<Specialization[]> {
    if (specializationsCache) {
        return Promise.resolve(specializationsCache);
    }
    
    if (specializationsPromise) {
        return specializationsPromise;
    }

    specializationsPromise = apiClient.get<Specialization[]>('/config/specializations')
        .then((res) => res.data)
        .then((data: Specialization[]) => {
            specializationsCache = data;
            specializationsPromise = null;
            return data;
        })
        .catch((err) => {
            specializationsPromise = null;
            throw err;
        });

    return specializationsPromise;
}

export function useSpecializations() {
    const [specializations, setSpecializations] = useState<Specialization[]>(specializationsCache || []);
    const [loading, setLoading] = useState(!specializationsCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (specializationsCache) {
            return;
        }

        fetchSpecializations()
            .then((data) => {
                setSpecializations(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { specializations, loading, error };
}

function fetchGoals(): Promise<Goal[]> {
    if (goalsCache) {
        return Promise.resolve(goalsCache);
    }
    
    if (goalsPromise) {
        return goalsPromise;
    }

    goalsPromise = apiClient.get<Goal[]>('/config/goals')
        .then((res) => res.data)
        .then((data: Goal[]) => {
            goalsCache = data;
            goalsPromise = null;
            return data;
        })
        .catch((err) => {
            goalsPromise = null;
            throw err;
        });

    return goalsPromise;
}

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>(goalsCache || []);
    const [loading, setLoading] = useState(!goalsCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (goalsCache) {
            return;
        }

        fetchGoals()
            .then((data) => {
                setGoals(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { goals, loading, error };
}

// ============= PREFETCH FUNCTIONS =============
// These ensure cache is populated before components try to use helper functions

export function prefetchConfig() {
    return Promise.all([
        fetchTags(),
        fetchSpecializations(),
        fetchGoals(),
    ]);
}

export function prefetchTags() {
    return fetchTags();
}

export function prefetchSpecializations() {
    return fetchSpecializations();
}

export function prefetchGoals() {
    return fetchGoals();
}

// ============= HELPER FUNCTIONS =============

// Tag helpers
export function getTagName(tag: Tag, locale: string) {
    return locale === 'pl' ? tag.namePl : tag.nameEn;
}

export function getTagById(id: string): Tag | undefined {
    return tagsCache?.find(tag => tag.id === id);
}

export function getTagNameById(id: string, locale: string): string {
    const tag = getTagById(id);
    return tag ? getTagName(tag, locale) : id;
}

// Specialization helpers
export function getSpecializationName(spec: Specialization, locale: string) {
    return locale === 'pl' ? spec.namePl : spec.nameEn;
}

export function getSpecializationById(id: string): Specialization | undefined {
    return specializationsCache?.find(spec => spec.id === id);
}

export function getSpecializationNameById(id: string, locale: string): string {
    const spec = getSpecializationById(id);
    return spec ? getSpecializationName(spec, locale) : id;
}

// Alias for backward compatibility
export const getCategoryById = getSpecializationById;

// Goal helpers
export function getGoalName(goal: Goal, locale: string) {
    return locale === 'pl' ? goal.namePl : goal.nameEn;
}

export function getGoalById(id: string): Goal | undefined {
    return goalsCache?.find(goal => goal.id === id);
}

export function getGoalNameById(id: string, locale: string): string {
    const goal = getGoalById(id);
    return goal ? getGoalName(goal, locale) : id;
}

// Get all data (for components that need full list without hooks)
export function getAllTags(): Tag[] {
    return tagsCache || [];
}

export function getAllSpecializations(): Specialization[] {
    return specializationsCache || [];
}

export function getAllGoals(): Goal[] {
    return goalsCache || [];
}