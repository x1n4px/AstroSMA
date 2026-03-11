class WordPressClient {
    constructor(baseUrl, username, password, timeout = 30000) {
        this.baseUrl = baseUrl;
        this.username = username;
        this.password = password;
        this.timeout = timeout;
        this.token = null;
    }

    async fetchWithTimeout(url, options = {}) {
        return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(this.timeout)
        });
    }

    async authenticate() {
        const credentials = Buffer.from(`${this.username}:${this.password}`).toString("base64");

        try {
            const response = await this.fetchWithTimeout(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
                method: "GET",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            this.token = credentials;
            return true;
        } catch (error) {
            console.error("WordPress authentication error:", error);
            return false;
        }
    }

    async createPost(postData) {
        if (!this.token) {
            const authenticated = await this.authenticate();
            if (!authenticated) {
                throw new Error("Failed to authenticate with WordPress");
            }
        }

        const payload = {
            title: postData.title,
            content: postData.content,
            status: postData.status || "draft",
            author: await this.getAuthorId(postData.author),
            categories: postData.categories || [],
            tags: postData.tags || [],
            excerpt: postData.excerpt || "",
            meta: {
                generated_by: "AstroSMA Workflows",
                generation_date: new Date().toISOString()
            }
        };

        const response = await this.fetchWithTimeout(`${this.baseUrl}/wp-json/wp/v2/posts`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${this.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to create post: ${error.message || response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            postId: result.id,
            postUrl: result.link,
            editUrl: `${this.baseUrl}/wp-admin/post.php?post=${result.id}&action=edit`
        };
    }

    async getAuthorId(username) {
        if (!username) {
            return 1;
        }

        try {
            const response = await this.fetchWithTimeout(`${this.baseUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(username)}`, {
                method: "GET",
                headers: {
                    Authorization: `Basic ${this.token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const users = await response.json();
                if (users.length > 0) {
                    return users[0].id;
                }
            }
        } catch (error) {
            console.error("Error getting author ID:", error);
        }

        return 1;
    }

    formatContentForWordPress(htmlContent) {
        let formatted = htmlContent
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            .replace(/<style[^>]*>.*?<\/style>/gi, "")
            .replace(/class="[^"]*"/gi, "")
            .replace(/style="[^"]*"/gi, "")
            .replace(/<button[^>]*>.*?<\/button>/gi, "")
            .replace(/onclick="[^"]*"/gi, "")
            .replace(/id="[^"]*"/gi, "");

        formatted = `
            <div class="astrosma-workflow-report">
                ${formatted}
                <hr/>
                <p><em>Este informe fue generado automáticamente desde AstroSMA Workflows</em></p>
            </div>
        `;

        return formatted;
    }
}

module.exports = WordPressClient;
