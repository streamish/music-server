import { TestAccountDto } from './test-account.dto';
import { createArrayResponseDto } from 'src/api/response.dto';

export class ListTestAccountsResponseDto extends createArrayResponseDto('accounts', TestAccountDto) {}
