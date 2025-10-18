const { PrismaClient } = require('@prisma/client');

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

module.exports.prisma = global.__prisma;



