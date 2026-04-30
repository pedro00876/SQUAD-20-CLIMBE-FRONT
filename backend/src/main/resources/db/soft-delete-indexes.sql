-- Migração: substituir unique constraints por partial unique indexes (soft delete)
-- Executar com aplicação parada. Script idempotente (IF EXISTS / IF NOT EXISTS).
-- As colunas created_at e deleted_at são adicionadas pelo Hibernate (ddl-auto=update).
--
-- Pré-verificação: executar antes para identificar os nomes reais das constraints:
-- SELECT tc.table_name, tc.constraint_name, ccu.column_name
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.constraint_column_usage ccu
--   ON tc.constraint_name = ccu.constraint_name
--  AND tc.table_schema = ccu.table_schema
-- WHERE tc.constraint_type = 'UNIQUE'
--   AND tc.table_name IN ('usuarios', 'empresas', 'cargos', 'permissoes', 'servicos')
-- ORDER BY tc.table_name, ccu.column_name;

-- Remover unique constraints dinamicamente (nomes variam por ambiente)
DO $$
DECLARE rec RECORD;
BEGIN
    FOR rec IN
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema = ccu.table_schema
        WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_name IN ('usuarios', 'empresas', 'cargos', 'permissoes', 'servicos')
          AND ccu.column_name IN ('email', 'cpf', 'cnpj', 'nome_cargo', 'descricao', 'nome')
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', rec.table_name, rec.constraint_name);
        RAISE NOTICE 'Dropped constraint: %.%', rec.table_name, rec.constraint_name;
    END LOOP;
END $$;

-- Criar partial unique indexes (unicidade apenas para registros ativos: deleted_at IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cargos_nome_active
    ON cargos(nome_cargo) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_permissoes_descricao_active
    ON permissoes(descricao) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_servicos_nome_active
    ON servicos(nome) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_active
    ON usuarios(email) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_cpf_active
    ON usuarios(cpf) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_cnpj_active
    ON empresas(cnpj) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_email_active
    ON empresas(email) WHERE deleted_at IS NULL;

-- Pós-validação: confirmar que os indexes foram criados
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename IN ('usuarios', 'empresas', 'cargos', 'permissoes', 'servicos')
--   AND indexname LIKE '%active%';
