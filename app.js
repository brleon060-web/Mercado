// Central de Dados
const DB = {
    get: (key) => JSON.parse(localStorage.getItem('aj_' + key) || '[]'),
    set: (key, val) => localStorage.setItem('aj_' + key, JSON.stringify(val)),
    
    // Sincronizar com GitHub
    async sync() {
        const token = localStorage.getItem('aj_gh_token');
        const user = localStorage.getItem('aj_gh_user');
        const repo = localStorage.getItem('aj_gh_repo');
        if(!token || !user || !repo) return alert("Configure o Backup no menu Salvamento!");

        const dados = {
            clientes: this.get('clientes'),
            produtos: this.get('produtos'),
            vendas: this.get('vendas'),
            lastSync: new Date().toISOString()
        };

        const url = `https://api.github.com/repos/${user}/${repo}/contents/database.json`;
        
        try {
            // 1. Pega o SHA do arquivo atual para poder sobrescrever
            const res = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
            const fileData = await res.json();
            const sha = fileData.sha;

            // 2. Envia os novos dados
            const update = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Sincronização AJ Mercado",
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(dados, null, 2)))),
                    sha: sha
                })
            });

            if(update.ok) alert("Sincronizado com Sucesso no GitHub!");
            else alert("Erro ao sincronizar. Verifique as permissões do Token.");
        } catch(e) { alert("Erro de conexão: " + e); }
    }
};
