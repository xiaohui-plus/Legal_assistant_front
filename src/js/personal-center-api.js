// 个人中心API客户�?- 完整对接后端
class PersonalCenterAPI {
    constructor() {
        this.baseURL = window.API_BASE_URL || 'http://localhost:8001';
        console.log('PersonalCenterAPI initialized with baseURL:', this.baseURL);
    }

    getToken() {
        return localStorage.getItem('token') || localStorage.getItem('access_token');
    }

    async request(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fullUrl = `${this.baseURL}${url}`;
        console.log(`[PersonalCenterAPI] ${options.method || 'GET'} ${fullUrl}`);

        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers
            });

            console.log(`[PersonalCenterAPI] Response status: ${response.status}`);

            if (response.status === 401) {
                console.error('[PersonalCenterAPI] 401 Unauthorized - Token expired');
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                alert('登录已过期，请重新登�?);
                window.location.href = 'professional.html';
                throw new Error('未授�?);
            }

            const result = await response.json();
            console.log(`[PersonalCenterAPI] Response data:`, result);
            return result;
        } catch (error) {
            console.error('[PersonalCenterAPI] Request failed:', error);
            console.error('[PersonalCenterAPI] URL:', fullUrl);
            console.error('[PersonalCenterAPI] Options:', options);
            throw error;
        }
    }

    // ==================== 咨询历史 ====================
    async getConsultations(page = 1, pageSize = 20) {
        return this.request(`/api/user/consultations?page=${page}&pageSize=${pageSize}`);
    }

    async getConsultationDetail(id) {
        return this.request(`/api/user/consultations/${id}`);
    }

    async deleteConsultation(id) {
        return this.request(`/api/user/consultations/${id}`, { method: 'DELETE' });
    }

    // ==================== 文书管理 ====================
    async getDocuments(page = 1, pageSize = 20) {
        return this.request(`/api/user/documents?page=${page}&pageSize=${pageSize}`);
    }

    async getDocumentDetail(id) {
        return this.request(`/api/user/documents/${id}`);
    }

    async downloadDocument(documentId) {
        const token = this.getToken();
        const response = await fetch(`${this.baseURL}/api/user/documents/${documentId}/download`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${documentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ==================== 证据管理 ====================
    async getEvidenceList(page = 1, pageSize = 20) {
        return this.request(`/api/user/evidence?page=${page}&pageSize=${pageSize}`);
    }

    async uploadEvidence(file, caseId, caseName, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', caseId);
        formData.append('caseName', caseName);
        if (options.folderId) formData.append('folderId', options.folderId);
        if (options.tags) formData.append('tags', options.tags);
        if (options.notes) formData.append('notes', options.notes);

        const token = this.getToken();
        const response = await fetch(`${this.baseURL}/api/user/evidence/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return response.json();
    }

    async deleteEvidence(id) {
        return this.request(`/api/user/evidence/${id}`, { method: 'DELETE' });
    }

    // ==================== 收藏�?====================
    async getFavorites(page = 1, pageSize = 20) {
        return this.request(`/api/user/favorites?page=${page}&pageSize=${pageSize}`);
    }

    async addFavorite(itemType, itemId, itemTitle, tags = '') {
        return this.request('/api/user/favorites', {
            method: 'POST',
            body: JSON.stringify({ itemType, itemId, itemTitle, tags })
        });
    }

    async deleteFavorite(id) {
        return this.request(`/api/user/favorites/${id}`, { method: 'DELETE' });
    }

    // ==================== 法律工具 ====================
    async calculateLitigationFee(claimAmount, caseType) {
        return this.request('/api/user/tools/litigation-fee', {
            method: 'POST',
            body: JSON.stringify({ claimAmount, caseType })
        });
    }

    async calculateInjuryCompensation(data) {
        return this.request('/api/user/tools/injury-compensation', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async calculateTax(income, specialDeductions, otherDeductions) {
        return this.request('/api/user/tools/tax', {
            method: 'POST',
            body: JSON.stringify({ income, specialDeductions, otherDeductions })
        });
    }

    async calculateCompensation(data) {
        return this.request('/api/user/tools/compensation', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ==================== 安全设置 ====================
    async changePassword(oldPassword, newPassword) {
        return this.request('/api/user/security/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword, newPassword })
        });
    }

    async getLoginDevices() {
        return this.request('/api/user/security/devices');
    }

    async logoutDevice(deviceId) {
        return this.request(`/api/user/security/devices/${deviceId}`, { method: 'DELETE' });
    }
}

// 创建全局实例
window.personalCenterAPI = new PersonalCenterAPI();
