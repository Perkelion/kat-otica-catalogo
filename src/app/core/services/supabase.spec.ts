import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase';

const BUCKET_URL = 'https://projeto.supabase.co/storage/v1/object/public/produtos/';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let remove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);

    // Storage falso
    remove = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.spyOn(service.client.storage, 'from').mockReturnValue({
      getPublicUrl: (caminho: string) => ({ data: { publicUrl: BUCKET_URL + caminho } }),
      remove,
    } as never);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('removerImagens', () => {
    it('apaga do bucket só as imagens que estão nele', async () => {
      await service.removerImagens([
        BUCKET_URL + 'wayfarer.png',
        'https://assets.sunglasshut.com/foto.png',
        BUCKET_URL + 'holbrook.png',
      ]);
      expect(remove).toHaveBeenCalledWith(['wayfarer.png', 'holbrook.png']);
    });

    it('decodifica nomes com caracteres especiais', async () => {
      await service.removerImagens([BUCKET_URL + 'foto%20nova.png']);
      expect(remove).toHaveBeenCalledWith(['foto nova.png']);
    });

    it('não chama o Storage quando não há imagens do bucket', async () => {
      await service.removerImagens(['https://upload.wikimedia.org/foto.jpg']);
      await service.removerImagens([]);
      expect(remove).not.toHaveBeenCalled();
    });

    it('não lança erro se o Storage falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      remove.mockResolvedValue({ data: null, error: new Error('falhou') });

      await expect(service.removerImagens([BUCKET_URL + 'x.png'])).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
