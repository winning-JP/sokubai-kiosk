package com.sokubai.kiosk.config;

import com.sokubai.kiosk.model.Item;
import com.sokubai.kiosk.repository.ItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ItemRepository itemRepository;

    public DataInitializer(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public void run(String... args) {
        if (itemRepository.count() > 0) {
            return;
        }
        itemRepository.save(seed("新刊『夜行列車の図鑑』", "新刊", 800, 12, "📖",
                "今即売会の新刊。B5 / 32p。サンプルはブースで見られます。"));
        itemRepository.save(seed("新刊セット（本＋アクスタ）", "新刊", 1400, 5, "🎁",
                "新刊とアクリルスタンドのセット。数量限定です。"));
        itemRepository.save(seed("既刊『窓辺の回路』", "既刊", 500, 3, "📘",
                "前回の既刊。残りわずかです。"));
        itemRepository.save(seed("アクリルスタンド", "グッズ", 700, 8, "✨",
                "新刊表紙のキャラクターアクスタ。"));
        itemRepository.save(seed("缶バッジ 3個セット", "グッズ", 400, 20, "🔵",
                "ランダム3個入り。"));
        itemRepository.save(seed("クリアファイル", "グッズ", 300, 0, "📁",
                "完売しました。入荷はありません。"));
        itemRepository.save(seed("無料ペーパー", "無料", 0, 40, "📄",
                "お会計の方に1部お渡しします。"));
    }

    private Item seed(String name, String category, int price, int stock, String emoji, String description) {
        Item item = new Item();
        item.setName(name);
        item.setCategory(category);
        item.setPrice(price);
        item.setStock(stock);
        item.setEmoji(emoji);
        item.setDescription(description);
        item.setSelling(true);
        return item;
    }
}
