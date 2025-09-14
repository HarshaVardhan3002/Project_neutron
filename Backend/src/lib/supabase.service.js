/**
 * Supabase Client Configuration for Project_Neutron LMS
 * Handles authentication and file storage
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Anonymous client for public operations
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload file to Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @param {Buffer|File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadFile(bucket, path, file, options = {}) {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
                ...options
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
}

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<Object>} Delete result
 */
async function deleteFile(bucket, path) {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('File delete error:', error);
        throw error;
    }
}

/**
 * Get signed URL for file access
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrl(bucket, path, expiresIn = 3600) {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    } catch (error) {
        console.error('Signed URL error:', error);
        throw error;
    }
}

module.exports = {
    supabaseAdmin,
    supabasePublic,
    uploadFile,
    deleteFile,
    getSignedUrl
};
