
import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../mock-data-service';
import { Customer , Transaction } from '../Model/customer.model'; 
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit{

  customers: Customer[] = [];
  customersWithTransactions: any[] = [];
  filteredCustomers: any[] = [];
  nameFilter: string = '';
  transactionAmountFilter: number | null = null;
  public chart: any;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.mockDataService.getCustomers().subscribe(customers => {
      this.customers = customers;
      this.loadTransactions();
    });
  }

  private loadTransactions(): void {
    this.customers.forEach(customer => {
      this.mockDataService.getTransactions(customer.id).subscribe(transactions => {
        const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        this.customersWithTransactions.push({
          ...customer,
          totalAmount: totalAmount,
          numberOfTransactions: transactions.length,
          transactions: transactions // Add transactions to the customer object
        });
        this.filterCustomers();
      });
    });
  }

  filterCustomers(): void {
    this.filteredCustomers = this.customersWithTransactions.filter(customer => {
      const matchesName = this.nameFilter ? customer.name.toLowerCase().includes(this.nameFilter.toLowerCase()) : true;
      const matchesTransactionAmount = this.transactionAmountFilter !== null ? customer.totalAmount === this.transactionAmountFilter : true;
      return matchesName && matchesTransactionAmount;
    });
  }

  createChart(customerId: number): void {
    const customer = this.customersWithTransactions.find(c => c.id === customerId);
    if (!customer) return;

    const transactions = customer.transactions;
    const dailyTotals = transactions.reduce((acc: { [key: string]: number }, transaction: Transaction) => {
      const date = transaction.date;
      acc[date] = (acc[date] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });

    const labels = Object.keys(dailyTotals);
    const data = Object.values(dailyTotals);

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart("MyChart", {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "Total Transaction Amount",
          data: data,
          backgroundColor: 'black',
          borderColor: 'white',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        aspectRatio: 2.5,
        scales: {
          x: {
            ticks: {
              color: 'white' // X-axis labels color
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)' // X-axis grid color
            }
          },
          y: {
            ticks: {
              color: 'white' // Y-axis labels color
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)' // Y-axis grid color
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'white' // Legend labels color
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Tooltip background color
            titleColor: 'black', // Tooltip title color
            bodyColor: 'black', // Tooltip body color
            borderColor: 'black', // Tooltip border color
            borderWidth: 1 // Tooltip border width
          }
        }
      }
    });
  }

  onSelectCustomer(customerId: number): void {
    this.createChart(customerId);
  }

}
