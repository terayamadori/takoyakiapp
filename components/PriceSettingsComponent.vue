<template>
  <div class="container">
    <h2>価格設定</h2>
    <form @submit.prevent="updatePrices" class="price-form">
      <div class="form-group">
        <label for="takoyakiPrice">たこ焼きの価格</label>
        <input
          type="number"
          v-model.number="form.takoyakiPrice"
          class="form-control"
          id="takoyakiPrice"
          placeholder="たこ焼きの価格を入力"
          @focus="setCurrentField('takoyakiPrice')"
        />
        <small v-if="existingPrices.takoyakiPrice !== null" class="text-muted">
          現在の価格: {{ existingPrices.takoyakiPrice }}円
        </small>
      </div>

      <div class="form-group">
        <label for="dessertPrice">デザートの価格</label>
        <input
          type="number"
          v-model.number="form.dessertPrice"
          class="form-control"
          id="dessertPrice"
          placeholder="デザートの価格を入力"
          @focus="setCurrentField('dessertPrice')"
        />
        <small v-if="existingPrices.dessertPrice !== null" class="text-muted">
          現在の価格: {{ existingPrices.dessertPrice }}円
        </small>
      </div>

      <div class="calculator mt-3">
        <div class="row">
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('1')">1</button>
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('2')">2</button>
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('3')">3</button>
        </div>
        <div class="row">
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('4')">4</button>
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('5')">5</button>
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('6')">6</button>
        </div>
        <div class="row">
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('7')">7</button>
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('8')">8</button>
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('9')">9</button>
        </div>
        <div class="row">
          <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('0')">0</button>
          <button type="button" class="btn btn-secondary btn-lg col-6 mx-1 my-1" @click="clearValue">C</button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg">更新</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        takoyakiPrice: null, // 初期値をnullに設定
        dessertPrice: null // 初期値をnullに設定
      },
      existingPrices: {
        takoyakiPrice: null,
        dessertPrice: null
      }
    };
  },
  async created() {
    await this.fetchCurrentPrices(); // 価格を取得
  },
  methods: {
    async fetchCurrentPrices() {
      try {
        const response = await this.$axios.$get('/api/pricesettings'); // 価格設定のAPIを呼び出し
        if (response.length > 0) {
          // 価格を整数に変換して設定
          this.existingPrices.takoyakiPrice = Math.floor(response[0].takoyaki_price); 
          this.existingPrices.dessertPrice = Math.floor(response[0].dessert_takoyaki_price);
          
          this.form.takoyakiPrice = this.existingPrices.takoyakiPrice; // フォームに既存の価格を設定
          this.form.dessertPrice = this.existingPrices.dessertPrice; // フォームに既存の価格を設定
        }
      } catch (error) {
        console.error('価格の取得に失敗しました:', error);
      }
    },
    setCurrentField(field) {
      this.currentField = field;
    },
    appendValue(value) {
      if (this.currentField) {
        this.form[this.currentField] = (this.form[this.currentField] || '') + value;
      }
    },
    clearValue() {
      if (this.currentField) {
        this.form[this.currentField] = '';
      }
    },
    async updatePrices() {
      try {
        await this.$axios.$patch('/api/pricesettings', {
          takoyaki_price: this.form.takoyakiPrice,
          dessert_takoyaki_price: this.form.dessertPrice
        });
        alert('価格が更新されました！');
        this.fetchCurrentPrices(); // 更新後に再度価格を取得
      } catch (error) {
        console.error('価格の更新に失敗しました:', error);
        alert('価格の更新に失敗しました: ' + error.message);
      }
    }
  }
};
</script>


<style scoped>
.text-muted {
  font-size: 0.9em;
}

.container {
  max-width: 400px; /* フォーム全体の幅を統一 */
  margin: 0 auto;
}

.calculator {
  width: 100%; /* フォーム幅に合わせる */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.calculator .row {
  width: 100%;
}

.calculator .btn {
  width: calc(33.33% - 8px); /* 横幅調整 */
  margin: 4px; /* ボタン間の余白を調整 */
}

.btn-primary {
  width: 100%; /* 更新ボタンの横幅をフォームと同じに */
  margin-top: 10px;
}
</style>
