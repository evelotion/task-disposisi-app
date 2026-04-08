{ pkgs, ... }: {
  channel = "stable-23.11"; 

  packages = [
    pkgs.nodejs_20
    pkgs.openssl
    pkgs.prisma-engines   # <-- INI KUNCI UTAMANYA BRO 🔥
  ];

  env = {
    # Kita paksa Prisma pakai mesin bawaan NixOS yang udah cocok 100% sama OpenSSL-nya
    PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
    PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
    PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
  };

  idx = {
    extensions = [];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
    };
  };
}